require("dotenv").config();

const { gerarRanking } = require("./ranking");

const fetchOriginal = global.fetch;

const oportunidades = [
  {
    id: 301,
    empresa: "Empresa Aberta",
    situacao: "aberta",
  },
  {
    id: 302,
    empresa: "Empresa Perdida",
    situacao: "perdida",
  },
  {
    id: 303,
    empresa: "Empresa Concluída",
    situacao: "concluida",
  },
];

function simularResposta(ranking) {
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

function criarResultado(id) {
  return {
    id,
    pontuacao: 90,
    justificativa: "Oportunidade com potencial comercial.",
    abordagem: "Entrar em contato com o decisor.",
  };
}

// TESTE 1
async function testeRankingSomenteAbertas() {
  console.log("\nTESTE 1 - Ranking somente com oportunidades abertas");

  simularResposta([criarResultado(301)]);

  try {
    const resultado = await gerarRanking(oportunidades);

    const ids = resultado.ranking.map((item) => item.id);

    if (
      resultado.ranking.length === 1 &&
      ids.includes(301) &&
      !ids.includes(302) &&
      !ids.includes(303)
    ) {
      console.log("APROVADO: somente a oportunidade aberta foi classificada.");
      console.log(resultado.ranking);
      return;
    }

    throw new Error("O ranking contém oportunidades incorretas.");
  } catch (error) {
    console.log("FALHA:", error.message);
    throw error;
  }
}

// TESTE 2
async function testeGeminiRetornaOportunidadeEncerrada() {
  console.log("\nTESTE 2 - Gemini tenta incluir oportunidades encerradas");

  simularResposta([
    criarResultado(301),
    criarResultado(302),
    criarResultado(303),
  ]);

  try {
    await gerarRanking(oportunidades);

    throw new Error(
      "O serviço aceitou oportunidades que não deveriam estar no ranking.",
    );
  } catch (error) {
    if (error.message.includes("identificador inválido")) {
      console.log("APROVADO: oportunidades encerradas foram rejeitadas.");
      console.log(error.message);
      return;
    }

    console.log("FALHA:", error.message);
    throw error;
  }
}

// TESTE 3
async function testeIdsDuplicadosComStatusDiferentes() {
  console.log("\nTESTE 3 - IDs duplicados com status diferentes");

  const oportunidadesDuplicadas = [
    {
      id: 401,
      empresa: "Empresa Aberta",
      situacao: "aberta",
    },
    {
      id: 401,
      empresa: "Empresa Perdida",
      situacao: "perdida",
    },
  ];

  simularResposta([criarResultado(401)]);

  try {
    await gerarRanking(oportunidadesDuplicadas);

    throw new Error("Duplicidade não identificada.");
  } catch (error) {
    if (error.message.includes("identificadores duplicados")) {
      console.log("APROVADO: IDs duplicados foram rejeitados.");
      console.log(error.message);
      return;
    }

    console.log("FALHA:", error.message);
    throw error;
  }
}

// TESTE 4
async function testeIdsDuplicadosComTiposDiferentes() {
  console.log("\nTESTE 4 - IDs duplicados com tipos diferentes");

  const oportunidadesDuplicadas = [
    {
      id: 401,
      empresa: "Empresa A",
      situacao: "aberta",
    },
    {
      id: "401",
      empresa: "Empresa B",
      situacao: "perdida",
    },
  ];

  simularResposta([criarResultado(401)]);

  try {
    await gerarRanking(oportunidadesDuplicadas);

    throw new Error("O serviço aceitou IDs duplicados com tipos diferentes.");
  } catch (error) {
    if (error.message.includes("identificadores duplicados")) {
      console.log(
        "APROVADO: IDs numéricos e textuais duplicados foram rejeitados.",
      );
      console.log(error.message);
      return;
    }

    console.log("FALHA:", error.message);
    throw error;
  }
}

// TESTE 5
async function testeOportunidadeEncerradaSemId() {
  console.log("\nTESTE 5 - Oportunidade encerrada sem identificador");

  const oportunidadesSemId = [
    {
      id: 501,
      empresa: "Empresa Aberta",
      situacao: "aberta",
    },
    {
      empresa: "Empresa Perdida",
      situacao: "perdida",
    },
  ];

  simularResposta([criarResultado(501)]);

  try {
    await gerarRanking(oportunidadesSemId);

    throw new Error(
      "O serviço aceitou uma oportunidade encerrada sem identificador.",
    );
  } catch (error) {
    if (error.message.includes("sem identificador")) {
      console.log("APROVADO: oportunidade encerrada sem ID foi rejeitada.");
      console.log(error.message);
      return;
    }

    console.log("FALHA:", error.message);
    throw error;
  }
}

// EXECUÇÃO DOS TESTES
async function executarTestes() {
  console.log("INICIANDO TESTES DE INTEGRIDADE DOS STATUS");

  let falhas = 0;

  try {
    await testeRankingSomenteAbertas();
  } catch {
    falhas++;
  }

  try {
    await testeGeminiRetornaOportunidadeEncerrada();
  } catch {
    falhas++;
  }

  try {
    await testeIdsDuplicadosComStatusDiferentes();
  } catch {
    falhas++;
  }

  try {
    await testeIdsDuplicadosComTiposDiferentes();
  } catch {
    falhas++;
  }

  try {
    await testeOportunidadeEncerradaSemId();
  } catch {
    falhas++;
  }

  global.fetch = fetchOriginal;

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

executarTestes();
