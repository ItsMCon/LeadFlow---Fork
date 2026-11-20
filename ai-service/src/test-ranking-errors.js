require("dotenv").config();

const { gerarRanking } = require("./ranking");

const fetchOriginal = global.fetch;

const oportunidades = [
  {
    id: 201,
    empresa: "Empresa I",
    nicho: "Tecnologia",
    decisor: "João Silva",
    cargo: "Diretor",
    email: "joao@empresai.com",
    telefone: "21999999999",
    situacao: "Aberta",
  },
  {
    id: 202,
    empresa: "Empresa II",
    nicho: "Indústria",
    decisor: "Maria Souza",
    cargo: "Gerente",
    email: "maria@empresai.com",
    telefone: "21988888888",
    situacao: "Aberta",
  },
];

let testesFalharam = 0;

// Simula uma resposta HTTP da Gemini.
function simularResposta(status, dados) {
  global.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => dados,
  });
}

// Monta uma resposta válida no formato da Gemini.
function respostaGemini(ranking) {
  return {
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
  };
}

// Executa um teste que deve produzir erro.
async function testarErro(nome, simulacao, mensagemEsperada) {
  console.log(`\n${nome}`);

  simularResposta(200, simulacao);

  try {
    await gerarRanking(oportunidades);

    console.log("FALHA: o erro não foi identificado.");
    testesFalharam++;
  } catch (error) {
    if (error.message.includes(mensagemEsperada)) {
      console.log("APROVADO: erro identificado corretamente.");
      console.log(error.message);
    } else {
      console.log("FALHA: mensagem inesperada.");
      console.log(error.message);
      testesFalharam++;
    }
  }
}

// Teste 1: chave de API inválida.
async function testeErroApi() {
  console.log("\nTESTE 1 - Erro HTTP da Gemini");

  simularResposta(400, {
    error: { message: "API key invalid" },
  });

  try {
    await gerarRanking(oportunidades);
    console.log("FALHA: o erro não foi identificado.");
    testesFalharam++;
  } catch (error) {
    if (error.message.includes("Erro na Gemini API (400)")) {
      console.log("APROVADO: erro identificado corretamente.");
      console.log(error.message);
    } else {
      console.log("FALHA: mensagem inesperada.");
      console.log(error.message);
      testesFalharam++;
    }
  }
}

// Teste 2: indisponibilidade temporária.
async function testeIndisponibilidade() {
  console.log("\nTESTE 2 - Gemini indisponível");

  simularResposta(503, {
    error: { message: "Service unavailable" },
  });

  try {
    await gerarRanking(oportunidades);
    console.log("FALHA: a indisponibilidade não foi identificada.");
    testesFalharam++;
  } catch (error) {
    if (error.message.includes("Erro na Gemini API (503)")) {
      console.log("APROVADO: indisponibilidade identificada.");
      console.log(error.message);
    } else {
      console.log("FALHA: mensagem inesperada.");
      console.log(error.message);
      testesFalharam++;
    }
  }
}

// Teste 3: resposta vazia.
async function testeRespostaVazia() {
  console.log("\nTESTE 3 - Resposta vazia");

  simularResposta(200, {
    candidates: [],
  });

  try {
    await gerarRanking(oportunidades);
    console.log("FALHA: a resposta vazia não foi identificada.");
    testesFalharam++;
  } catch (error) {
    if (error.message.includes("ranking válido")) {
      console.log("APROVADO: resposta vazia identificada.");
      console.log(error.message);
    } else {
      console.log("FALHA: mensagem inesperada.");
      console.log(error.message);
      testesFalharam++;
    }
  }
}

// Teste 4: JSON inválido.
async function testeJsonInvalido() {
  console.log("\nTESTE 4 - JSON inválido");

  simularResposta(200, {
    candidates: [
      {
        content: {
          parts: [{ text: "Isso não é um JSON válido." }],
        },
      },
    ],
  });

  try {
    await gerarRanking(oportunidades);
    console.log("FALHA: o JSON inválido não foi identificado.");
    testesFalharam++;
  } catch (error) {
    if (error.message.includes("JSON válido")) {
      console.log("APROVADO: JSON inválido identificado.");
      console.log(error.message);
    } else {
      console.log("FALHA: mensagem inesperada.");
      console.log(error.message);
      testesFalharam++;
    }
  }
}

// Teste 5: ID inexistente.
async function testeIdInvalido() {
  console.log("\nTESTE 5 - ID inexistente");

  const dados = respostaGemini([
    {
      id: 999,
      pontuacao: 90,
      justificativa: "Teste",
      abordagem: "Teste",
    },
    {
      id: 202,
      pontuacao: 80,
      justificativa: "Teste",
      abordagem: "Teste",
    },
  ]);

  await testarErro(
    "Verificando ID inexistente",
    dados,
    "identificador inválido",
  );
}

// Teste 6: pontuação inválida.
async function testePontuacaoInvalida() {
  console.log("\nTESTE 6 - Pontuação inválida");

  const dados = respostaGemini([
    {
      id: 201,
      pontuacao: 150,
      justificativa: "Teste",
      abordagem: "Teste",
    },
    {
      id: 202,
      pontuacao: 80,
      justificativa: "Teste",
      abordagem: "Teste",
    },
  ]);

  await testarErro(
    "Verificando pontuação fora do intervalo",
    dados,
    "pontuação inválida",
  );
}

// Teste 7: ID duplicado na resposta.
async function testeIdDuplicado() {
  console.log("\nTESTE 7 - ID duplicado na resposta da Gemini");

  const dados = respostaGemini([
    {
      id: 201,
      pontuacao: 90,
      justificativa: "Teste",
      abordagem: "Teste",
    },
    {
      id: 201,
      pontuacao: 80,
      justificativa: "Teste",
      abordagem: "Teste",
    },
    {
      id: 202,
      pontuacao: 70,
      justificativa: "Teste",
      abordagem: "Teste",
    },
  ]);

  await testarErro(
    "Verificando IDs duplicados",
    dados,
    "oportunidade duplicada",
  );
}

// Teste 8: oportunidade omitida.
async function testeOportunidadeOmitida() {
  console.log("\nTESTE 8 - Oportunidade omitida");

  const dados = respostaGemini([
    {
      id: 201,
      pontuacao: 90,
      justificativa: "Teste",
      abordagem: "Teste",
    },
  ]);

  await testarErro(
    "Verificando oportunidade ausente",
    dados,
    "de fora do ranking",
  );
}

// Teste 9: justificativa ou abordagem vazia.
async function testeTextoVazio() {
  console.log("\nTESTE 9 - Justificativa ou abordagem vazia");

  const dados = respostaGemini([
    {
      id: 201,
      pontuacao: 90,
      justificativa: "",
      abordagem: "Teste",
    },
    {
      id: 202,
      pontuacao: 80,
      justificativa: "Teste",
      abordagem: "Teste",
    },
  ]);

  await testarErro(
    "Verificando texto vazio",
    dados,
    "justificativa ou abordagem inválida",
  );
}

// Teste 10: ordenação automática.
async function testeOrdenacao() {
  console.log("\nTESTE 10 - Ordenação do ranking");

  simularResposta(
    200,
    respostaGemini([
      {
        id: 201,
        pontuacao: 40,
        justificativa: "Teste",
        abordagem: "Teste",
      },
      {
        id: 202,
        pontuacao: 90,
        justificativa: "Teste",
        abordagem: "Teste",
      },
    ]),
  );

  try {
    const resultado = await gerarRanking(oportunidades);

    const primeiro = resultado.ranking[0];
    const segundo = resultado.ranking[1];

    if (
      primeiro.id === 202 &&
      segundo.id === 201 &&
      primeiro.pontuacao >= segundo.pontuacao
    ) {
      console.log("APROVADO: ranking ordenado corretamente.");
      console.log(
        resultado.ranking.map((item) => `${item.id}: ${item.pontuacao} pontos`),
      );
    } else {
      console.log("FALHA: ordenação incorreta.");
      console.log(resultado.ranking);
      testesFalharam++;
    }
  } catch (error) {
    console.log("FALHA: erro inesperado.");
    console.log(error.message);
    testesFalharam++;
  }
}

// Executa todos os testes.
async function executarTestes() {
  console.log("INICIANDO TESTES DE ERRO E INTEGRIDADE DO RANKING");

  try {
    await testeErroApi();
    await testeIndisponibilidade();
    await testeRespostaVazia();
    await testeJsonInvalido();
    await testeIdInvalido();
    await testePontuacaoInvalida();
    await testeIdDuplicado();
    await testeOportunidadeOmitida();
    await testeTextoVazio();
    await testeOrdenacao();
  } finally {
    global.fetch = fetchOriginal;
  }

  console.log("\n====================================");
  console.log("RESULTADO FINAL DOS TESTES");
  console.log(`Testes com falha: ${testesFalharam}`);
  console.log("====================================");

  if (testesFalharam > 0) {
    process.exitCode = 1;
    console.log("ATENÇÃO: existem testes que precisam ser corrigidos.");
  } else {
    console.log("TODOS OS TESTES PASSARAM.");
  }
}

executarTestes();
