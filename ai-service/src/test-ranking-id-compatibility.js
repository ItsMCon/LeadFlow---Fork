const { gerarRanking } = require("./ranking");

const fetchOriginal = global.fetch;

function simularRespostaGemini(idRetornado) {
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
                      id: idRetornado,
                      pontuacao: 85,
                      justificativa: "Boa oportunidade comercial.",
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
}

async function executarTeste(nome, idEntrada, idRetornado, esperado) {
  console.log(`\n${nome}`);

  simularRespostaGemini(idRetornado);

  try {
    const resultado = await gerarRanking([
      { id: idEntrada, situacao: "aberta" },
    ]);

    if (esperado === "valido") {
      console.log("APROVADO: identificadores reconhecidos.");
      console.log("ID de entrada:", idEntrada);
      console.log("ID retornado:", resultado.ranking[0].id);
      return true;
    }

    console.log("FALHA: o serviço aceitou um identificador diferente.");
    return false;
  } catch (error) {
    if (
      esperado === "invalido" &&
      error.message.includes("identificador inválido")
    ) {
      console.log("APROVADO: identificador diferente rejeitado.");
      console.log(error.message);
      return true;
    }

    console.log("FALHA:", error.message);
    return false;
  }
}

async function executarTestes() {
  console.log("TESTES DE COMPATIBILIDADE DE IDENTIFICADORES");

  let falhas = 0;

  try {
    if (
      !(await executarTeste(
        "TESTE 1 - Entrada numérica e resposta textual",
        701,
        "701",
        "valido",
      ))
    )
      falhas++;

    if (
      !(await executarTeste(
        "TESTE 2 - Entrada textual e resposta numérica",
        "702",
        702,
        "valido",
      ))
    )
      falhas++;

    if (
      !(await executarTeste(
        "TESTE 3 - Identificador diferente",
        703,
        "704",
        "invalido",
      ))
    )
      falhas++;
  } finally {
    global.fetch = fetchOriginal;
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
