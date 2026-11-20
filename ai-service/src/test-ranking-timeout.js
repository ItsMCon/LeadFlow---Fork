const { gerarRanking } = require("./ranking");

async function executarTeste() {
  console.log("TESTE DE TIMEOUT REAL DA GEMINI");
  console.log("Tempo limite configurado: 20 segundos.");

  const oportunidades = [{ id: 1301, situacao: "aberta" }];

  let requisicaoInterrompida = false;

  // Simula uma requisição que permanece pendente
  // até receber o sinal de cancelamento.
  global.fetch = (url, opcoes) => {
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
  };

  const inicio = Date.now();

  try {
    await gerarRanking(oportunidades);

    console.log("FALHA: a requisição não foi interrompida.");
    process.exitCode = 1;
  } catch (error) {
    const duracao = Date.now() - inicio;

    console.log("\nRESULTADO DO TESTE");
    console.log(`Tempo decorrido: ${(duracao / 1000).toFixed(2)} segundos.`);
    console.log(`Requisição interrompida: ${requisicaoInterrompida}`);

    if (
      requisicaoInterrompida &&
      error.message.includes("Tempo limite excedido") &&
      duracao >= 19000 &&
      duracao < 25000
    ) {
      console.log("\nAPROVADO: timeout real funcionando.");
    } else {
      console.log("\nFALHA: timeout não funcionou como esperado.");
      console.log("Erro:", error.message);
      process.exitCode = 1;
    }
  }
}

executarTeste();
