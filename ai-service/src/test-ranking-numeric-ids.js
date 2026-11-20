require("dotenv").config();

const { gerarRanking } = require("./ranking");

async function executarTeste(nome, id, esperado) {
  console.log(`\n${nome}`);

  const oportunidades = [{ id, situacao: "aberta" }];

  try {
    const resultado = await gerarRanking(oportunidades);

    if (esperado === "valido") {
      console.log("APROVADO: identificador numérico aceito.");
      console.log("ID retornado:", resultado.ranking[0]?.id);
      return true;
    }

    console.log("FALHA: identificador inválido foi aceito.");
    return false;
  } catch (error) {
    if (esperado === "invalido" && error.message.includes("identificador")) {
      console.log("APROVADO: identificador inválido rejeitado.");
      console.log(error.message);
      return true;
    }

    console.log("FALHA:", error.message);
    return false;
  }
}

async function executarTestes() {
  console.log("TESTES DE LIMITES DOS IDENTIFICADORES NUMÉRICOS");

  let falhas = 0;

  if (!(await executarTeste("TESTE 1 - ID zero", 0, "invalido"))) falhas++;

  if (!(await executarTeste("TESTE 2 - ID negativo", -1, "invalido"))) falhas++;

  if (!(await executarTeste("TESTE 3 - ID decimal", 12.5, "invalido")))
    falhas++;

  if (!(await executarTeste("TESTE 4 - NaN", NaN, "invalido"))) falhas++;

  if (!(await executarTeste("TESTE 5 - Infinity", Infinity, "invalido")))
    falhas++;

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
