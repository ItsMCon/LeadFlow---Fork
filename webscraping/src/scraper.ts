import { extrairDados } from "./extrairDados.js";
import { normalizarDados } from "./normalizarDados.js";
import { identificarSegmento } from "./identificarSegmento.js";

import { isIP } from "node:net";
import { criarLookupSeguro, ipBloqueado } from "./dns.js";

import { Agent, fetch } from "undici";
import type { Response as UndiciResponse } from "undici";
import type { DadosEmpresa } from "./types.js";

// Permite utilizar o Undici normalmente ou injetar simulações nos testes.
export type RequisicaoHTTP = typeof fetch;

const LIMITE_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10000;

// ======================================================
// 1. AGENTE HTTP COM DNS VALIDADO
// ======================================================

// O Undici utiliza o endereço retornado pelo lookup validado
// para estabelecer a conexão.

const agenteSeguro = new Agent({
  connect: {
    lookup: criarLookupSeguro(),
  },
});

// ======================================================
// 2. VALIDAÇÃO DA URL
// ======================================================

function validarURL(endereco: string): URL {
  let url: URL;

  try {
    url = new URL(endereco);
  } catch {
    throw new Error("URL inválida.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Apenas URLs HTTP e HTTPS são permitidas.");
  }

  if (url.username || url.password) {
    throw new Error("URLs com credenciais não são permitidas.");
  }

  // Restringe as portas de destino.
  const portaEsperada = url.protocol === "https:" ? "443" : "80";

  if (url.port && url.port !== portaEsperada) {
    throw new Error(
      "Acesso permitido somente pelas portas HTTP 80 e HTTPS 443.",
    );
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  const hostnamesBloqueados = [
    "localhost",
    "localhost.localdomain",
    "local",
    "internal",
    "home.arpa",
  ];

  if (
    hostnamesBloqueados.includes(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Acesso a endereços locais não é permitido.");
  }

  // Verifica diretamente endereços IP informados na URL.
  const familiaIP = isIP(hostname);

  if (familiaIP !== 0 && ipBloqueado(hostname)) {
    throw new Error("Acesso a IP privado ou reservado não é permitido.");
  }

  return url;
}

// ======================================================
// 3. LEITURA LIMITADA DO CORPO HTTP
// ======================================================

async function lerHTMLLimitado(resposta: UndiciResponse): Promise<string> {
  if (!resposta.body) {
    throw new Error("A resposta HTTP não possui conteúdo.");
  }

  const leitor = resposta.body.getReader();
  const partes: Uint8Array[] = [];

  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await leitor.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      // Interrompe a leitura assim que ultrapassar 2 MB.
      if (totalBytes > LIMITE_BYTES) {
        await leitor.cancel().catch(() => undefined);

        throw new Error("Página excede o limite de 2 MB.");
      }

      partes.push(value);
    }
  } catch (erro) {
    await leitor.cancel().catch(() => undefined);
    throw erro;
  } finally {
    leitor.releaseLock();
  }

  const conteudo = new Uint8Array(totalBytes);

  let posicao = 0;

  for (const parte of partes) {
    conteudo.set(parte, posicao);
    posicao += parte.byteLength;
  }

  return new TextDecoder("utf-8").decode(conteudo);
}

// ======================================================
// 4. BUSCA DO HTML
// ======================================================

async function buscarHTML(
  url: URL,
  requisicao: RequisicaoHTTP = fetch,
): Promise<string> {
  const resposta = await requisicao(url, {
    method: "GET",

    headers: {
      "User-Agent": "LeadFlowScraper/1.0",
      Accept: "text/html",
    },

    signal: AbortSignal.timeout(TIMEOUT_MS),

    // Não permite redirecionamentos automáticos.
    redirect: "error",

    // Utiliza o agente com validação DNS.
    dispatcher: agenteSeguro,
  });

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status}: ${resposta.statusText}`);
  }

  const tipoConteudo = resposta.headers.get("content-type") || "";

  if (!tipoConteudo.toLowerCase().includes("text/html")) {
    throw new Error(
      `Tipo de conteúdo não permitido: ${tipoConteudo || "desconhecido"}.`,
    );
  }

  // Verificação antecipada pelo Content-Length.
  const tamanhoDeclarado = resposta.headers.get("content-length");

  if (tamanhoDeclarado !== null) {
    const tamanho = Number(tamanhoDeclarado);

    if (Number.isFinite(tamanho) && tamanho > LIMITE_BYTES) {
      await resposta.body?.cancel().catch(() => undefined);

      throw new Error("Página excede o limite de 2 MB.");
    }
  }

  // Verificação real durante a leitura do corpo.
  return await lerHTMLLimitado(resposta);
}

// ======================================================
// 5. EXECUÇÃO DO SCRAPING
// ======================================================

export async function executarScraping(
  endereco: string,
  requisicao: RequisicaoHTTP = fetch,
): Promise<DadosEmpresa> {
  console.log("\nIniciando scraping...");
  console.log(`URL: ${endereco}`);

  // Validação da URL.
  const url = validarURL(endereco);

  // Etapa 1: buscar HTML.
  console.log("\n[1/4] Buscando HTML...");

  const html = await buscarHTML(url, requisicao);

  console.log("HTML obtido com sucesso.");

  // Etapa 2: extrair informações.
  console.log("\n[2/4] Extraindo informações...");

  const dadosExtraidos = extrairDados(html);

  console.log(`Título: ${dadosExtraidos.titulo}`);
  console.log(`Descrição: ${dadosExtraidos.descricao}`);

  // Etapa 3: normalizar informações.
  console.log("\n[3/4] Normalizando informações...");

  const dadosNormalizados = normalizarDados(dadosExtraidos);

  console.log("Informações normalizadas.");

  // Etapa 4: identificar segmento.
  console.log("\n[4/4] Identificando segmento...");

  const resultadoSegmento = identificarSegmento(dadosNormalizados);

  console.log(`Segmento: ${resultadoSegmento.segmento}`);
  console.log(`Confiança: ${resultadoSegmento.confianca}`);

  const resultado: DadosEmpresa = {
    url: url.href,
    titulo: dadosNormalizados.titulo,
    descricao: dadosNormalizados.descricao,
    segmento: resultadoSegmento.segmento,
    confiancaSegmento: resultadoSegmento.confianca,
    palavrasEncontradas: resultadoSegmento.palavrasEncontradas,
    dataColeta: new Date().toISOString(),
  };

  console.log("\nScraping concluído com sucesso!");

  return resultado;
}

// ======================================================
// 6. EXECUÇÃO PELO TERMINAL
// ======================================================

async function main(): Promise<void> {
  const endereco = process.argv[2];

  if (!endereco) {
    console.error("Uso: npx tsx src/scraper.ts <URL>");
    process.exitCode = 1;
    return;
  }

  try {
    const resultado = await executarScraping(endereco);

    console.log("\n============================================");
    console.log("RESULTADO FINAL");
    console.log("============================================");

    console.log(JSON.stringify(resultado, null, 2));
  } catch (erro) {
    console.error("\nFalha durante o scraping:");
    console.error(erro);

    if (erro instanceof Error) {
      console.error("Causa:", erro.cause);
    }

    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
