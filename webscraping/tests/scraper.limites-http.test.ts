import assert from "node:assert/strict";

import { Response } from "undici";

import { executarScraping, type RequisicaoHTTP } from "../src/scraper.js";

const URL_TESTE = "https://empresa-teste.com.br";
const LIMITE_BYTES = 2 * 1024 * 1024;

let aprovados = 0;
let reprovados = 0;

function criarStream(partes: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controlador) {
      for (const parte of partes) {
        controlador.enqueue(parte);
      }

      controlador.close();
    },
  });
}

function criarResposta(
  partes: Uint8Array[],
  cabecalhos: Record<string, string> = {},
): Response {
  return new Response(criarStream(partes), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...cabecalhos,
    },
  });
}

function criarRequisicao(resposta: Response): RequisicaoHTTP {
  return (async () => resposta) as RequisicaoHTTP;
}

async function executarTeste(
  nome: string,
  teste: () => Promise<void>,
): Promise<void> {
  try {
    await teste();

    aprovados++;
    console.log(`APROVADO: ${nome}`);
  } catch (erro) {
    reprovados++;

    console.error(`REPROVADO: ${nome}`);
    console.error(erro);
  }
}

// ======================================================
// TESTE 1 - HTML FRAGMENTADO DENTRO DO LIMITE
// ======================================================

async function testarHTMLFragmentado(): Promise<void> {
  const html = new TextEncoder().encode(
    `<html>
            <head>
                <title>Empresa Teste</title>
                <meta name="description" content="Empresa de tecnologia.">
            </head>
            <body></body>
        </html>`,
  );

  // Divide o HTML em vários fragmentos.
  const partes = [
    html.slice(0, 10),
    html.slice(10, 25),
    html.slice(25, 50),
    html.slice(50, 80),
    html.slice(80),
  ];

  const resposta = criarResposta(partes);

  const resultado = await executarScraping(
    URL_TESTE,
    criarRequisicao(resposta),
  );

  assert.equal(resultado.titulo, "Empresa Teste");
}

// ======================================================
// TESTE 2 - HTML FRAGMENTADO ACIMA DE 2 MB
// ======================================================

async function testarLimiteFragmentado(): Promise<void> {
  const partes = [
    new Uint8Array(900 * 1024),
    new Uint8Array(900 * 1024),
    new Uint8Array(300 * 1024),
  ];

  const resposta = criarResposta(partes);

  await assert.rejects(
    () => executarScraping(URL_TESTE, criarRequisicao(resposta)),
    /Página excede o limite de 2 MB/,
  );
}

// ======================================================
// TESTE 3 - CONTEÚDO DESCOMPRIMIDO ACIMA DE 2 MB
// ======================================================

async function testarLimiteConteudoComprimido(): Promise<void> {
  const tamanhoDescomprimido = LIMITE_BYTES + 1;

  const conteudo = new Uint8Array(tamanhoDescomprimido);

  // Simula o corpo já descomprimido que o fetch do Undici
  // entrega à aplicação após processar uma resposta gzip.
  //
  // O Content-Length representa o tamanho comprimido,
  // enquanto o stream representa o tamanho descomprimido.
  const resposta = criarResposta([conteudo], {
    "content-encoding": "gzip",
    "content-length": "120",
  });

  await assert.rejects(
    () => executarScraping(URL_TESTE, criarRequisicao(resposta)),
    /Página excede o limite de 2 MB/,
  );
}

// ======================================================
// EXECUÇÃO
// ======================================================

async function main(): Promise<void> {
  console.log("========================================");
  console.log("TESTES DE LIMITES HTTP - LEADFLOW");
  console.log("========================================\n");

  await executarTeste(
    "Aceita HTML recebido em vários fragmentos",
    testarHTMLFragmentado,
  );

  await executarTeste(
    "Bloqueia HTML fragmentado acima de 2 MB",
    testarLimiteFragmentado,
  );

  await executarTeste(
    "Bloqueia conteúdo descomprimido acima de 2 MB",
    testarLimiteConteudoComprimido,
  );

  console.log("\n========================================");
  console.log(`Aprovados: ${aprovados}`);
  console.log(`Reprovados: ${reprovados}`);
  console.log(`Total: ${aprovados + reprovados}`);
  console.log("========================================");

  if (reprovados > 0) {
    process.exitCode = 1;
  }
}

main().catch((erro) => {
  console.error("\nFalha na execução dos testes:");
  console.error(erro);
  process.exitCode = 1;
});
