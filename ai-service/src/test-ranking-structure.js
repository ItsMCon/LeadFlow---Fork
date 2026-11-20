const { gerarRanking } = require("./ranking");

function simularRespostaGemini(resposta) {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify(resposta),
              },
            ],
          },
        },
      ],
    }),
  });
}

let falhas = 0;

async function executarTeste(nome, resposta, esperado) {
  console.log(`\n${nome}`);

  simularRespostaGemini(resposta);

  try {
    const resultado = await gerarRanking([{ id: 1001, situacao: "aberta" }]);

    if (esperado === "valido") {
      console.log("APROVADO: estrutura aceita.");
      console.log(resultado);
    } else {
      console.log("FALHA: estrutura inválida foi aceita.");
      console.log(resultado);
      falhas++;
    }
  } catch (error) {
    if (esperado === "invalido") {
      console.log("APROVADO: estrutura inválida rejeitada.");
      console.log(error.message);
    } else {
      console.log("FALHA:", error.message);
      falhas++;
    }
  }
}

async function executarTestes() {
  console.log("TESTES DE ESTRUTURA DAS RESPOSTAS");

  const itemValido = {
    id: 1001,
    pontuacao: 85,
    justificativa: "A empresa apresenta potencial comercial.",
    abordagem: "Apresentar uma proposta ao decisor.",
  };

  await executarTeste(
    "TESTE 1 - Campo ranking ausente",
    { resultado: [itemValido] },
    "invalido",
  );

  await executarTeste(
    "TESTE 2 - Ranking como objeto",
    { ranking: itemValido },
    "invalido",
  );

  await executarTeste(
    "TESTE 3 - Array diretamente, sem objeto externo",
    [itemValido],
    "invalido",
  );

  await executarTeste(
    "TESTE 4 - Propriedade adicional no objeto principal",
    {
      ranking: [itemValido],
      observacao: "Informação inesperada",
    },
    "invalido",
  );

  await executarTeste(
    "TESTE 5 - Propriedade adicional no item",
    {
      ranking: [
        {
          ...itemValido,
          confianca: 0.95,
        },
      ],
    },
    "invalido",
  );

  await executarTeste(
    "TESTE 6 - Estrutura correta",
    { ranking: [itemValido] },
    "valido",
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
