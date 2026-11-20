const { gerarRanking } = require("./ranking");

let falhas = 0;

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Extrai o ID da oportunidade enviada dentro do prompt.
function extrairId(body) {
  const requisicao = JSON.parse(body);

  const prompt = requisicao.contents[0].parts[0].text;

  const marcador = "OPORTUNIDADES PARA AVALIAR:";

  const posicao = prompt.lastIndexOf(marcador);

  if (posicao === -1) {
    throw new Error("Não foi possível localizar as oportunidades no prompt.");
  }

  const dados = prompt.slice(posicao + marcador.length).trim();

  const oportunidades = JSON.parse(dados);

  if (
    !Array.isArray(oportunidades) ||
    !oportunidades[0] ||
    !identificadorValido(oportunidades[0].id)
  ) {
    throw new Error("Não foi possível identificar o ID da oportunidade.");
  }

  return Number(oportunidades[0].id);
}

// Verifica se o identificador é válido.
function identificadorValido(id) {
  return (
    (typeof id === "number" && Number.isSafeInteger(id) && id > 0) ||
    (typeof id === "string" && id.trim() !== "")
  );
}

// Cria uma resposta simulada da Gemini.
function criarResposta(id) {
  const resultado = {
    ranking: [
      {
        id,
        pontuacao: 80,
        justificativa: "Oportunidade com potencial comercial.",
        abordagem: "Realizar contato comercial.",
      },
    ],
  };

  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify(resultado),
              },
            ],
          },
        },
      ],
    }),
  };
}

// Registra o resultado de cada teste.
function registrarResultado(nome, aprovado, detalhes = "") {
  console.log(`\n${nome}`);

  if (aprovado) {
    console.log("APROVADO.");
  } else {
    console.log("FALHA.");
    falhas++;
  }

  if (detalhes) {
    console.log(detalhes);
  }
}

// TESTE 1: duas requisições simultâneas.
async function testarRequisicoesSimultaneas() {
  console.log("\nTESTE 1 - Duas requisições simultâneas");

  let requisicoesAtivas = 0;
  let maximoSimultaneo = 0;

  global.fetch = async (url, opcoes) => {
    const id = extrairId(opcoes.body);

    requisicoesAtivas++;

    maximoSimultaneo = Math.max(maximoSimultaneo, requisicoesAtivas);

    await esperar(200);

    requisicoesAtivas--;

    return criarResposta(id);
  };

  const resultados = await Promise.all([
    gerarRanking([{ id: 1401, situacao: "aberta" }]),
    gerarRanking([{ id: 1402, situacao: "aberta" }]),
  ]);

  const aprovado =
    resultados.length === 2 &&
    resultados[0].ranking[0].id === 1401 &&
    resultados[1].ranking[0].id === 1402 &&
    maximoSimultaneo === 2;

  registrarResultado(
    "Duas requisições processadas simultaneamente",
    aprovado,
    `Máximo de requisições simultâneas: ${maximoSimultaneo}`,
  );
}

// TESTE 2: uma requisição falha e outra funciona.
async function testarFalhaIndependente() {
  console.log("\nTESTE 2 - Uma requisição falha e outra funciona");

  global.fetch = async (url, opcoes) => {
    const id = extrairId(opcoes.body);

    await esperar(100);

    if (id === 1403) {
      throw new Error("ECONNRESET: falha simulada.");
    }

    return criarResposta(id);
  };

  const resultados = await Promise.allSettled([
    gerarRanking([{ id: 1403, situacao: "aberta" }]),
    gerarRanking([{ id: 1404, situacao: "aberta" }]),
  ]);

  const falhaEsperada =
    resultados[0].status === "rejected" &&
    resultados[0].reason.message.includes("Falha de comunicação");

  const sucessoEsperado =
    resultados[1].status === "fulfilled" &&
    resultados[1].value.ranking[0].id === 1404;

  registrarResultado(
    "Falha isolada sem prejudicar a outra requisição",
    falhaEsperada && sucessoEsperado,
    `Requisição 1403: ${resultados[0].status}\nRequisição 1404: ${resultados[1].status}`,
  );
}

// TESTE 3: uma requisição é cancelada sem prejudicar a outra.
async function testarCancelamentoIndependente() {
  console.log("\nTESTE 3 - Cancelamento independente");

  let requisicaoInterrompida = false;
  let segundaRequisicaoConcluida = false;

  global.fetch = (url, opcoes) => {
    const id = extrairId(opcoes.body);

    if (id === 1405) {
      return new Promise((resolve, reject) => {
        opcoes.signal.addEventListener(
          "abort",
          () => {
            requisicaoInterrompida = true;

            const erro = new Error("Requisição interrompida.");
            erro.name = "AbortError";

            reject(erro);
          },
          { once: true },
        );
      });
    }

    if (id === 1406) {
      return esperar(100).then(() => {
        segundaRequisicaoConcluida = true;

        return criarResposta(id);
      });
    }

    throw new Error("Identificador inesperado.");
  };

  const resultados = await Promise.allSettled([
    gerarRanking([{ id: 1405, situacao: "aberta" }]),
    gerarRanking([{ id: 1406, situacao: "aberta" }]),
  ]);

  const cancelamentoEsperado =
    resultados[0].status === "rejected" &&
    resultados[0].reason.message.includes("Tempo limite excedido");

  const sucessoEsperado =
    resultados[1].status === "fulfilled" &&
    resultados[1].value.ranking[0].id === 1406;

  registrarResultado(
    "Cancelamento de uma requisição não interfere na outra",
    requisicaoInterrompida &&
      cancelamentoEsperado &&
      segundaRequisicaoConcluida &&
      sucessoEsperado,
    `Requisição 1405: ${resultados[0].status}\nRequisição 1406: ${resultados[1].status}\nRequisição 1405 interrompida: ${requisicaoInterrompida}`,
  );
}

// Executa todos os testes.
async function executarTestes() {
  console.log("TESTES DE CONCORRÊNCIA DO LEADFLOW AI SERVICE");

  try {
    await testarRequisicoesSimultaneas();
    await testarFalhaIndependente();
    await testarCancelamentoIndependente();
  } catch (error) {
    console.log("\nERRO DURANTE A EXECUÇÃO DOS TESTES:");
    console.log(error.message);

    falhas++;
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

executarTestes();
