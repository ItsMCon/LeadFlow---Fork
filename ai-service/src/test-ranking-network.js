
const { gerarRanking } = require("./ranking");

let falhas = 0;

const fetchOriginal = global.fetch;

const oportunidades = [
  { id: 1201, situacao: "aberta" },
];

function simularFetch(comportamento) {
  global.fetch = comportamento;
}

async function executarTeste(nome, comportamento, verificarErro) {
  console.log(`\n${nome}`);

  simularFetch(comportamento);

  try {
    await gerarRanking(oportunidades);

    console.log("FALHA: o serviço não identificou o problema.");
    falhas++;
  } catch (error) {
    if (verificarErro(error)) {
      console.log("APROVADO: falha identificada corretamente.");
      console.log("Erro:", error.message);
    } else {
      console.log("FALHA: erro inesperado.");
      console.log(error.message);
      falhas++;
    }
  }
}

async function executarTestes() {
  console.log("TESTES DE COMUNICAÇÃO COM A GEMINI");

  try {
    await executarTeste(
      "TESTE 1 - Conexão interrompida",
      async () => {
        throw new Error("ECONNRESET: conexão interrompida.");
      },
      (error) =>
        error.message.includes("Falha na comunicação") &&
        error.message.includes("ECONNRESET"),
    );

    await executarTeste(
      "TESTE 2 - Requisição abortada",
      async () => {
        const error = new Error("A operação foi abortada.");
        error.name = "AbortError";
        throw error;
      },
      (error) =>
        error.message.includes("Tempo limite de comunicação") &&
        error.message.includes("excedido"),
    );

    await executarTeste(
      "TESTE 3 - Erro HTTP 429",
      async () => ({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: "Limite de requisições excedido.",
          },
        }),
      }),
      (error) =>
        error.message.includes("Falha na API Gemini") &&
        error.message.includes("Limite de requisições"),
    );

    await executarTeste(
      "TESTE 4 - Erro HTTP 503",
      async () => ({
        ok: false,
        status: 503,
        json: async () => ({
          error: {
            message: "Serviço temporariamente indisponível.",
          },
        }),
      }),
      (error) =>
        error.message.includes("Falha na API Gemini") &&
        error.message.includes("503") === false &&
        error.message.includes("indisponível"),
    );

    await executarTeste(
      "TESTE 5 - Resposta HTTP com JSON inválido",
      async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Resposta não contém JSON válido.");
        },
      }),
      (error) =>
        error.message.includes("não contém JSON válido"),
    );
  } finally {
    global.fetch = fetchOriginal;
  }

  console.log("\n====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes com falha: ${falhas}`);
  console.log("====================================");

  if (falhas === 0) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    console.log("ATENÇÃO: existem testes que falharam.");
    process.exitCode = 1;
  }
}

executarTestes().catch((error) => {
  global.fetch = fetchOriginal;
  console.error("ERRO INESPERADO:", error);
  process.exitCode = 1;
});