import { Response } from "undici";

import { executarScraping, type RequisicaoHTTP } from "../src/scraper.js";

// ============================================
// LEADFLOW - TESTES DE ERRO DO SCRAPER
// ============================================

const URL_TESTE = "https://empresa-teste.com.br";

let aprovados = 0;
let total = 0;

// ============================================
// 1. SIMULAÇÃO DE RESPOSTAS HTTP
// ============================================

function simularResposta(
  status: number,
  conteudo: string,
  tipoConteudo: string,
  tamanho?: number,
): RequisicaoHTTP {
  const headers: Record<string, string> = {
    "Content-Type": tipoConteudo,
  };

  if (tamanho !== undefined) {
    headers["Content-Length"] = String(tamanho);
  }

  return async () => {
    return new Response(conteudo, {
      status,
      headers,
    });
  };
}

// ============================================
// 2. FUNÇÃO AUXILIAR PARA TESTAR ERROS
// ============================================

async function testarErro(
  nome: string,
  operacao: () => Promise<unknown>,
  mensagemEsperada?: string,
): Promise<void> {
  total++;

  try {
    await operacao();

    console.log(`Teste ${total} - ${nome}: FALHOU`);
    console.log("Era esperado que a operação gerasse um erro.");
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);

    const correto =
      !mensagemEsperada ||
      mensagem.toLowerCase().includes(mensagemEsperada.toLowerCase());

    if (correto) {
      aprovados++;
    }

    console.log(`Teste ${total} - ${nome}:`, correto ? "APROVADO" : "FALHOU");

    if (!correto) {
      console.log("Mensagem esperada:", mensagemEsperada);
      console.log("Mensagem recebida:", mensagem);
    }
  }
}

// ============================================
// 3. EXECUÇÃO DOS TESTES
// ============================================

async function executarTestes(): Promise<void> {
  console.log("============================================");
  console.log("LEADFLOW - TESTES DE ERRO DO SCRAPER");
  console.log("============================================");

  // TESTE 1: URL inválida.

  await testarErro(
    "URL inválida",
    () => executarScraping("isto-nao-e-uma-url"),
    "URL inválida",
  );

  // TESTE 2: protocolo não permitido.

  await testarErro(
    "Protocolo não permitido",
    () => executarScraping("ftp://empresa.com.br"),
    "HTTP e HTTPS",
  );

  // TESTE 3: erro HTTP 404.

  const requisicao404 = simularResposta(
    404,
    "Página não encontrada",
    "text/html",
  );

  await testarErro(
    "Erro HTTP 404",
    () => executarScraping(URL_TESTE, requisicao404),
    "404",
  );

  // TESTE 4: falha de conexão.

  const requisicaoIndisponivel: RequisicaoHTTP = async () => {
    throw new TypeError("fetch failed");
  };

  await testarErro(
    "Servidor indisponível",
    () => executarScraping(URL_TESTE, requisicaoIndisponivel),
    "fetch failed",
  );

  // TESTE 5: conteúdo que não é HTML.

  const requisicaoJSON = simularResposta(
    200,
    '{"mensagem":"resposta em JSON"}',
    "application/json",
  );

  await testarErro(
    "Conteúdo não HTML",
    () => executarScraping(URL_TESTE, requisicaoJSON),
    "Tipo de conteúdo não permitido",
  );

  // TESTE 6: timeout simulado.

  const requisicaoTimeout: RequisicaoHTTP = async () => {
    throw new Error("Timeout simulado.");
  };

  await testarErro(
    "Timeout",
    () => executarScraping(URL_TESTE, requisicaoTimeout),
    "timeout",
  );

  // TESTE 7: tamanho declarado acima de 2 MB.

  const requisicaoTamanhoDeclarado = simularResposta(
    200,
    "<html></html>",
    "text/html",
    3 * 1024 * 1024,
  );

  await testarErro(
    "Limite de tamanho pelo Content-Length",
    () => executarScraping(URL_TESTE, requisicaoTamanhoDeclarado),
    "2 MB",
  );

  // TESTE 8: conteúdo real acima de 2 MB.

  const htmlGrande =
    "<html><body>" + "A".repeat(3 * 1024 * 1024) + "</body></html>";

  const requisicaoConteudoGrande = simularResposta(
    200,
    htmlGrande,
    "text/html",
  );

  await testarErro(
    "Limite de tamanho do conteúdo",
    () => executarScraping(URL_TESTE, requisicaoConteudoGrande),
    "2 MB",
  );

  // ============================================
  // 4. RESULTADO FINAL
  // ============================================

  console.log("\n============================================");
  console.log("RESULTADO DOS TESTES");
  console.log("============================================");

  console.log(`Aprovados: ${aprovados}`);
  console.log(`Total: ${total}`);
  console.log(`Reprovados: ${total - aprovados}`);

  console.log("============================================");

  if (aprovados !== total) {
    process.exitCode = 1;
  }
}

executarTestes();
