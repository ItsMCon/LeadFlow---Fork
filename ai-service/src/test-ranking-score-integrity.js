const { gerarRanking } = require("./ranking");

// Simula uma resposta da Gemini sem realizar uma chamada externa.
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

async function executarTeste(nome, rankingIA, oportunidades, validar) {
  console.log(`\n${nome}`);

  simularRespostaGemini(rankingIA);

  try {
    const resultado = await gerarRanking(oportunidades);

    if (validar(resultado.ranking)) {
      console.log("APROVADO.");
    } else {
      console.log("FALHA: resultado diferente do esperado.");
      console.log(resultado.ranking);
      falhas++;
    }
  } catch (error) {
    console.log("FALHA:", error.message);
    falhas++;
  }
}

async function executarTestes() {
  console.log("TESTES DE INTEGRIDADE DAS PONTUAÇÕES");

  // TESTE 1: pontuações iguais.
  await executarTeste(
    "TESTE 1 - Pontuações iguais",
    [
      {
        id: 801,
        pontuacao: 80,
        justificativa: "Evidências comerciais relevantes.",
        abordagem: "Apresentar solução.",
      },
      {
        id: 802,
        pontuacao: 80,
        justificativa: "Evidências comerciais relevantes.",
        abordagem: "Apresentar solução.",
      },
    ],
    [
      { id: 801, situacao: "aberta" },
      { id: 802, situacao: "aberta" },
    ],
    (ranking) =>
      ranking.length === 2 && ranking.every((item) => item.pontuacao === 80),
  );

  // TESTE 2: pontuações nos limites permitidos.
  await executarTeste(
    "TESTE 2 - Pontuações 0 e 100",
    [
      {
        id: 803,
        pontuacao: 0,
        justificativa: "Sem evidências comerciais relevantes.",
        abordagem: "Investigar necessidades.",
      },
      {
        id: 804,
        pontuacao: 100,
        justificativa: "Evidências comerciais muito fortes.",
        abordagem: "Priorizar contato.",
      },
    ],
    [
      { id: 803, situacao: "aberta" },
      { id: 804, situacao: "aberta" },
    ],
    (ranking) =>
      ranking.length === 2 &&
      ranking[0].id === 804 &&
      ranking[0].pontuacao === 100 &&
      ranking[1].id === 803 &&
      ranking[1].pontuacao === 0,
  );

  // TESTE 3: resposta inicialmente fora de ordem.
  await executarTeste(
    "TESTE 3 - Ordenação decrescente",
    [
      {
        id: 805,
        pontuacao: 30,
        justificativa: "Menor prioridade.",
        abordagem: "Contato posterior.",
      },
      {
        id: 806,
        pontuacao: 95,
        justificativa: "Maior prioridade.",
        abordagem: "Contato imediato.",
      },
      {
        id: 807,
        pontuacao: 65,
        justificativa: "Prioridade intermediária.",
        abordagem: "Agendar contato.",
      },
    ],
    [
      { id: 805, situacao: "aberta" },
      { id: 806, situacao: "aberta" },
      { id: 807, situacao: "aberta" },
    ],
    (ranking) =>
      ranking.length === 3 &&
      ranking[0].id === 806 &&
      ranking[1].id === 807 &&
      ranking[2].id === 805,
  );

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
