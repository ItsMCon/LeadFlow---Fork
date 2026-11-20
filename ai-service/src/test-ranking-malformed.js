const { gerarRanking } = require("./ranking");

// Simula diretamente a resposta HTTP da Gemini.
function simularRespostaGemini(texto, incluirTexto = true) {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: incluirTexto ? [{ text: texto }] : [],
          },
        },
      ],
    }),
  });
}

let falhas = 0;

async function executarTeste(nome, texto, esperado, incluirTexto = true) {
  console.log(`\n${nome}`);

  simularRespostaGemini(texto, incluirTexto);

  try {
    const resultado = await gerarRanking([{ id: 1101, situacao: "aberta" }]);

    if (esperado === "valido") {
      console.log("APROVADO: resposta aceita.");
      console.log(resultado);
    } else {
      console.log("FALHA: resposta inválida foi aceita.");
      console.log(resultado);
      falhas++;
    }
  } catch (error) {
    if (esperado === "invalido") {
      console.log("APROVADO: resposta inválida rejeitada.");
      console.log(error.message);
    } else {
      console.log("FALHA:", error.message);
      falhas++;
    }
  }
}

async function executarTestes() {
  console.log("TESTES DE RESPOSTAS MALFORMADAS");

  await executarTeste(
    "TESTE 1 - Gemini sem conteúdo textual",
    "",
    "invalido",
    false,
  );

  await executarTeste("TESTE 2 - JSON incompleto", '{"ranking": [', "invalido");

  await executarTeste("TESTE 3 - Conteúdo null", "null", "invalido");

  await executarTeste(
    "TESTE 4 - Ranking vazio com oportunidade aberta",
    JSON.stringify({ ranking: [] }),
    "invalido",
  );

  await executarTeste(
    "TESTE 5 - JSON válido com uma oportunidade",
    JSON.stringify({
      ranking: [
        {
          id: 1101,
          pontuacao: 85,
          justificativa: "A empresa apresenta potencial comercial.",
          abordagem: "Apresentar uma proposta ao decisor.",
        },
      ],
    }),
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
