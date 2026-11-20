const { gerarRanking } = require("./ranking");

function criarRespostaGemini(body) {
  const requisicao = JSON.parse(body);
  const prompt = requisicao.contents[0].parts[0].text;

  const marcador = "OPORTUNIDADES PARA AVALIAR:";
  const posicao = prompt.lastIndexOf(marcador);

  if (posicao === -1) {
    throw new Error("Não foi possível localizar as oportunidades no prompt.");
  }

  const dados = prompt.slice(posicao + marcador.length).trim();
  const oportunidades = JSON.parse(dados);

  const ranking = oportunidades.map((oportunidade, indice) => ({
    id: String(oportunidade.id),
    pontuacao: 100 - (indice % 101),
    justificativa: "Justificativa simulada para o teste de volume.",
    abordagem: "Abordagem comercial simulada para o teste de volume.",
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

function criarOportunidades(quantidade) {
  return Array.from({ length: quantidade }, (_, indice) => ({
    id: 20000 + indice,
    empresa: `Empresa ${indice + 1}`,
    nicho: "Tecnologia",
    decisor: `Decisor ${indice + 1}`,
    cargo: "Diretor",
    situacao: "aberta",
    observacoes: "Oportunidade comercial para teste de volume.",
  }));
}

async function executarTeste(quantidade) {
  const oportunidades = criarOportunidades(quantidade);
  const inicio = performance.now();

  const resultado = await gerarRanking(oportunidades);

  const duracao = performance.now() - inicio;

  if (!Array.isArray(resultado.ranking)) {
    throw new Error("O serviço não retornou um ranking válido.");
  }

  if (resultado.ranking.length !== quantidade) {
    throw new Error(
      `Esperadas ${quantidade} oportunidades, recebidas ${resultado.ranking.length}.`,
    );
  }

  const ids = new Set(resultado.ranking.map((item) => String(item.id)));

  if (ids.size !== quantidade) {
    throw new Error("Existem identificadores duplicados no resultado.");
  }

  for (const oportunidade of oportunidades) {
    if (!ids.has(String(oportunidade.id))) {
      throw new Error(`Oportunidade ${oportunidade.id} ausente no ranking.`);
    }
  }

  for (let i = 1; i < resultado.ranking.length; i++) {
    if (resultado.ranking[i - 1].pontuacao < resultado.ranking[i].pontuacao) {
      throw new Error("O ranking não está ordenado por pontuação decrescente.");
    }
  }

  console.log(`${quantidade} oportunidades processadas corretamente.`);
  console.log(`Tempo de execução: ${duracao.toFixed(2)} ms.`);
  console.log("APROVADO.\n");
}

async function executarTestes() {
  const fetchOriginal = global.fetch;
  let falhas = 0;

  console.log("TESTES DE VOLUME DO LEADFLOW AI SERVICE\n");

  global.fetch = async (url, options) => {
    return criarRespostaGemini(options.body);
  };

  const quantidades = [10, 50, 100, 250];

  for (const quantidade of quantidades) {
    console.log(`TESTE - ${quantidade} oportunidades`);

    try {
      await executarTeste(quantidade);
    } catch (error) {
      falhas++;
      console.log(`REPROVADO: ${error.message}\n`);
    }
  }

  global.fetch = fetchOriginal;

  console.log("====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes com falha: ${falhas}`);
  console.log("====================================");

  if (falhas === 0) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    console.log("ALGUNS TESTES FALHARAM.");
  }
}

executarTestes().catch((error) => {
  console.error("ERRO INESPERADO:", error);
  process.exitCode = 1;
});
