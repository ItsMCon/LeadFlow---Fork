const { gerarRanking } = require("./ranking");

function criarRespostaGemini(body) {
  const requisicao = JSON.parse(body);
  const prompt = requisicao.contents[0].parts[0].text;

  const marcador = "OPORTUNIDADES PARA AVALIAR:";
  const posicao = prompt.lastIndexOf(marcador);

  if (posicao === -1) {
    throw new Error("Marcador das oportunidades não encontrado.");
  }

  const oportunidades = JSON.parse(
    prompt.slice(posicao + marcador.length).trim(),
  );

  const ranking = oportunidades.map((oportunidade, indice) => ({
    id: String(oportunidade.id),
    pontuacao: 90 - indice,
    justificativa: "Justificativa simulada de estabilidade.",
    abordagem: "Abordagem comercial simulada.",
  }));

  return {
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
  };
}

async function executarTestes() {
  const fetchOriginal = global.fetch;

  let falhas = 0;
  let sucessos = 0;

  const TOTAL_EXECUCOES = 100;

  console.log("TESTES DE ESTABILIDADE DO LEADFLOW AI SERVICE\n");
  console.log(`Total de execuções previstas: ${TOTAL_EXECUCOES}\n`);

  global.fetch = async (url, options) => criarRespostaGemini(options.body);

  const inicio = performance.now();

  try {
    for (let i = 1; i <= TOTAL_EXECUCOES; i++) {
      const id = 40000 + i;

      try {
        const resultado = await gerarRanking([
          {
            id,
            empresa: `Empresa ${i}`,
            situacao: "aberta",
            observacoes: "Oportunidade comercial para teste de estabilidade.",
          },
        ]);

        if (
          !resultado.ranking ||
          resultado.ranking.length !== 1 ||
          String(resultado.ranking[0].id) !== String(id)
        ) {
          throw new Error("Resultado incorreto.");
        }

        sucessos++;
      } catch (error) {
        falhas++;
        console.log(`Execução ${i} falhou: ${error.message}`);
      }

      if (i % 10 === 0) {
        console.log(`${i}/${TOTAL_EXECUCOES} execuções concluídas.`);
      }
    }
  } finally {
    global.fetch = fetchOriginal;
  }

  const duracao = performance.now() - inicio;

  console.log("\n====================================");
  console.log("RESULTADO FINAL");
  console.log(`Execuções realizadas: ${sucessos + falhas}`);
  console.log(`Sucessos: ${sucessos}`);
  console.log(`Falhas: ${falhas}`);
  console.log(`Tempo total: ${duracao.toFixed(2)} ms`);
  console.log("====================================");

  if (falhas === 0 && sucessos === TOTAL_EXECUCOES) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    console.log("TESTE DE ESTABILIDADE REPROVADO.");
  }
}

executarTestes().catch((error) => {
  console.error("ERRO INESPERADO:", error);
  process.exitCode = 1;
});
