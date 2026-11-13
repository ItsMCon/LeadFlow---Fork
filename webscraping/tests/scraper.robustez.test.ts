import { Response } from "undici";
import { executarScraping, type RequisicaoHTTP } from "../src/scraper.js";

// ============================================
// LEADFLOW - TESTES DE ROBUSTEZ DA EXTRAÇÃO
// ============================================

let aprovados = 0;
let total = 0;

// Simula o retorno de uma página HTML.
function simularHTML(html: string): RequisicaoHTTP {
  return async () => {
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  };
}

// Executa um teste e compara os resultados.
async function testarResultado(
  nome: string,
  html: string,
  verificacao: (
    resultado: Awaited<ReturnType<typeof executarScraping>>,
  ) => boolean,
): Promise<void> {
  total++;

  try {
    const requisicao = simularHTML(html);

    const resultado = await executarScraping(
      "https://empresa-teste.com.br",
      requisicao,
    );

    const correto = verificacao(resultado);

    if (correto) {
      aprovados++;
    }

    console.log(`Teste ${total} - ${nome}:`, correto ? "APROVADO" : "FALHOU");

    if (!correto) {
      console.log("Resultado recebido:", {
        titulo: resultado.titulo,
        descricao: resultado.descricao,
      });
    }
  } catch (erro) {
    console.log(`Teste ${total} - ${nome}: FALHOU`);
    console.log(erro);
  }
}

// ============================================
// EXECUÇÃO DOS TESTES
// ============================================

async function executarTestes(): Promise<void> {
  console.log("============================================");
  console.log("LEADFLOW - TESTES DE ROBUSTEZ");
  console.log("============================================");

  // Teste 1: página sem título.
  await testarResultado(
    "Página sem título",
    `
            <html>
                <head>
                    <meta name="description" content="Empresa de tecnologia.">
                </head>
                <body>
                    <h1>Empresa Teste</h1>
                </body>
            </html>
        `,
    (resultado) =>
      resultado.titulo === "" &&
      resultado.descricao === "Empresa de tecnologia.",
  );

  // Teste 2: página sem descrição.
  await testarResultado(
    "Página sem descrição",
    `
            <html>
                <head>
                    <title>Empresa Teste</title>
                </head>
                <body>
                    <h1>Empresa de tecnologia</h1>
                </body>
            </html>
        `,
    (resultado) =>
      resultado.titulo === "Empresa Teste" && resultado.descricao === "",
  );

  // Teste 3: página sem título e sem descrição.
  await testarResultado(
    "Página sem título e descrição",
    `
            <html>
                <body>
                    <h1>Empresa Teste</h1>
                    <p>Conteúdo da página.</p>
                </body>
            </html>
        `,
    (resultado) => resultado.titulo === "" && resultado.descricao === "",
  );

  // Teste 4: HTML malformado.
  await testarResultado(
    "HTML malformado",
    `
            <html>
                <head>
                    <title>Empresa Teste</title>
                    <meta name="description"
                        content="Empresa especializada em tecnologia.">
                <body>
                    <h1>Empresa Teste
                    <p>Conteúdo sem fechamento
        `,
    (resultado) =>
      resultado.titulo === "Empresa Teste" &&
      resultado.descricao === "Empresa especializada em tecnologia.",
  );

  // Teste 5: descrição Open Graph.
  await testarResultado(
    "Descrição via Open Graph",
    `
            <html>
                <head>
                    <title>Empresa Teste</title>
                    <meta property="og:description"
                        content="Empresa especializada em automação industrial.">
                </head>
                <body></body>
            </html>
        `,
    (resultado) =>
      resultado.descricao === "Empresa especializada em automação industrial.",
  );

  // Teste 6: espaços e quebras de linha.
  await testarResultado(
    "Normalização de espaços",
    `
            <html>
                <head>
                    <title>
                        Empresa

                        de     Tecnologia
                    </title>
                    <meta name="description"
                        content="Empresa    especializada
                        em       automação.">
                </head>
                <body></body>
            </html>
        `,
    (resultado) =>
      resultado.titulo === "Empresa de Tecnologia" &&
      resultado.descricao === "Empresa especializada em automação.",
  );

  console.log("\n============================================");
  console.log(`RESULTADO: ${aprovados}/${total} APROVADOS`);
  console.log("============================================");

  if (aprovados !== total) {
    process.exitCode = 1;
  }
}

executarTestes();
