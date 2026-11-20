const { gerarRanking } = require("./ranking");

function criarRespostaValida(body) {
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
    justificativa: "Justificativa simulada de recuperação.",
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

function criarRespostaInvalida() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Resposta inválida",
              },
            ],
          },
        },
      ],
    }),
  };
}

async function verificarRecuperacao(nome, primeiraFalha, id) {
  console.log(`TESTE - ${nome}`);

  const fetchOriginal = global.fetch;
  let chamadas = 0;

  global.fetch = async (url, options) => {
    chamadas++;

    if (chamadas === 1) {
      return primeiraFalha();
    }

    return criarRespostaValida(options.body);
  };

  try {
    let erroIdentificado = false;

    try {
      await gerarRanking([
        {
          id,
          empresa: `Empresa ${id}`,
          situacao: "aberta",
        },
      ]);
    } catch (error) {
      erroIdentificado = true;
      console.log(`Falha inicial identificada: ${error.message}`);
    }

    if (!erroIdentificado) {
      throw new Error("A primeira falha não foi identificada.");
    }

    const resultado = await gerarRanking([
      {
        id: id + 1,
        empresa: `Empresa ${id + 1}`,
        situacao: "aberta",
      },
    ]);

    if (
      !resultado.ranking ||
      resultado.ranking.length !== 1 ||
      String(resultado.ranking[0].id) !== String(id + 1)
    ) {
      throw new Error(
        "A requisição posterior não foi processada corretamente.",
      );
    }

    if (chamadas !== 2) {
      throw new Error(`Esperadas 2 chamadas, recebidas ${chamadas}.`);
    }

    console.log("Nova requisição processada corretamente.");
    console.log("APROVADO.\n");

    return true;
  } finally {
    global.fetch = fetchOriginal;
  }
}

async function executarTestes() {
  let falhas = 0;

  console.log("TESTES DE RECUPERAÇÃO DO LEADFLOW AI SERVICE\n");

  const testes = [
    {
      nome: "Recuperação após falha de conexão",
      id: 5001,
      falha: async () => {
        throw new Error("ECONNRESET: conexão interrompida.");
      },
    },
    {
      nome: "Recuperação após indisponibilidade da API",
      id: 5003,
      falha: async () => ({
        ok: false,
        status: 503,
        json: async () => ({
          error: { message: "Serviço temporariamente indisponível." },
        }),
      }),
    },
    {
      nome: "Recuperação após resposta HTTP inválida",
      id: 5005,
      falha: async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("JSON inválido.");
        },
      }),
    },
    {
      nome: "Recuperação após conteúdo inválido da Gemini",
      id: 5007,
      falha: async () => criarRespostaInvalida(),
    },
  ];

  for (const teste of testes) {
    try {
      const aprovado = await verificarRecuperacao(
        teste.nome,
        teste.falha,
        teste.id,
      );

      if (!aprovado) falhas++;
    } catch (error) {
      falhas++;
      console.log(`REPROVADO: ${error.message}\n`);
    }
  }

  console.log("====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes realizados: ${testes.length}`);
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
