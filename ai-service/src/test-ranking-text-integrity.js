const { gerarRanking } = require("./ranking");

const fetchOriginal = global.fetch;

function simularRespostaGemini(ranking) {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({ ranking }),
              },
            ],
          },
        },
      ],
    }),
  });
}

let falhas = 0;
let aprovados = 0;

async function executarTeste(nome, item, esperado) {
  console.log(`\n${nome}`);

  simularRespostaGemini([
    {
      id: 901,
      pontuacao: 80,
      justificativa: "Justificativa válida.",
      abordagem: "Abordagem comercial válida.",
      ...item,
    },
  ]);

  try {
    const resultado = await gerarRanking([{ id: 901, situacao: "aberta" }]);

    if (esperado === "valido") {
      console.log("APROVADO: conteúdo válido aceito.");
      aprovados++;
    } else {
      console.log("FALHA: conteúdo inválido foi aceito.");
      console.log(resultado.ranking);
      falhas++;
    }
  } catch (error) {
    const mensagem = error.message.toLowerCase();

    const erroDeTexto =
      mensagem.includes("justificativa inválida") ||
      mensagem.includes("abordagem inválida");

    if (esperado === "invalido" && erroDeTexto) {
      console.log("APROVADO: conteúdo inválido rejeitado.");
      console.log(error.message);
      aprovados++;
    } else {
      console.log("FALHA:", error.message);
      falhas++;
    }
  }
}

async function executarTestes() {
  console.log("TESTES DE INTEGRIDADE DOS TEXTOS");

  try {
    await executarTeste(
      "TESTE 1 - Justificativa vazia",
      { justificativa: "" },
      "invalido",
    );

    await executarTeste(
      "TESTE 2 - Justificativa com espaços",
      { justificativa: "   " },
      "invalido",
    );

    await executarTeste(
      "TESTE 3 - Abordagem vazia",
      { abordagem: "" },
      "invalido",
    );

    await executarTeste(
      "TESTE 4 - Abordagem com espaços",
      { abordagem: "   " },
      "invalido",
    );

    await executarTeste(
      "TESTE 5 - Justificativa numérica",
      { justificativa: 123 },
      "invalido",
    );

    await executarTeste(
      "TESTE 6 - Abordagem numérica",
      { abordagem: 456 },
      "invalido",
    );

    await executarTeste(
      "TESTE 7 - Justificativa como array",
      { justificativa: [] },
      "invalido",
    );

    await executarTeste(
      "TESTE 8 - Abordagem como objeto",
      { abordagem: {} },
      "invalido",
    );

    await executarTeste(
      "TESTE 9 - Textos válidos",
      {
        justificativa: "A empresa apresenta sinais de expansão.",
        abordagem: "Entrar em contato com o decisor para apresentar a solução.",
      },
      "valido",
    );
  } finally {
    global.fetch = fetchOriginal;
  }

  console.log("\n====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes aprovados: ${aprovados}`);
  console.log(`Testes com falha: ${falhas}`);
  console.log("====================================");

  if (falhas === 0) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    console.log("ATENÇÃO: existem testes que falharam.");
    process.exitCode = 1;
  }
}

executarTestes();
