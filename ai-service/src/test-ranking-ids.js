require("dotenv").config();

const { gerarRanking } = require("./ranking");

const fetchOriginal = global.fetch;

global.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify({
                ranking: [
                  {
                    id: 701,
                    pontuacao: 90,
                    justificativa: "Oportunidade com potencial comercial.",
                    abordagem: "Entrar em contato com o decisor.",
                  },
                ],
              }),
            },
          ],
        },
      },
    ],
  }),
});

async function executarTeste(nome, oportunidades, tipoEsperado) {
  console.log(`\n${nome}`);

  try {
    const resultado = await gerarRanking(oportunidades);

    if (tipoEsperado === "valido") {
      console.log("APROVADO: ID numérico aceito corretamente.");
      console.log("Resultado:", resultado.ranking);
    } else {
      console.log("FALHA: o serviço aceitou um ID inválido.");
      process.exitCode = 1;
    }
  } catch (error) {
    if (
      tipoEsperado === "invalido" &&
      error.message.toLowerCase().includes("identificador")
    ) {
      console.log("APROVADO:", error.message);
    } else {
      console.log("FALHA:", error.message);
      process.exitCode = 1;
    }
  }
}

async function executarTestes() {
  console.log("TESTES DE TIPOS DE IDENTIFICADORES");

  try {
    await executarTeste(
      "TESTE 1 - ID booleano",
      [{ id: true, situacao: "aberta" }],
      "invalido",
    );

    await executarTeste(
      "TESTE 2 - ID objeto",
      [{ id: {}, situacao: "aberta" }],
      "invalido",
    );

    await executarTeste(
      "TESTE 3 - ID array",
      [{ id: [], situacao: "aberta" }],
      "invalido",
    );

    await executarTeste(
      "TESTE 4 - ID numérico válido",
      [{ id: 701, situacao: "aberta" }],
      "valido",
    );
  } finally {
    global.fetch = fetchOriginal;
  }
}

executarTestes();
