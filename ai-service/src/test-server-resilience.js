const http = require("http");

const URL_BASE = "http://localhost:3001";

function requisitar(caminho, metodo = "GET", corpo = null) {
  return new Promise((resolve, reject) => {
    const opcoes = {
      hostname: "localhost",
      port: 3001,
      path: caminho,
      method: metodo,
      headers: {},
    };

    if (corpo !== null) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.headers["Content-Length"] = Buffer.byteLength(corpo);
    }

    const req = http.request(opcoes, (res) => {
      let resposta = "";

      res.on("data", (parte) => {
        resposta += parte;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          corpo: resposta,
        });
      });
    });

    req.on("error", reject);

    if (corpo !== null) {
      req.write(corpo);
    }

    req.end();
  });
}

async function executarTestes() {
  console.log("TESTES DE RESILIÊNCIA DO SERVIDOR\n");

  let aprovados = 0;

  // Teste 1: Requisição com JSON inválido.
  try {
    const resultado = await requisitar(
      "/api/ranking",
      "POST",
      "{json-invalido",
    );

    if (resultado.status !== 400) {
      throw new Error(`Esperado HTTP 400, recebido HTTP ${resultado.status}.`);
    }

    console.log("APROVADO: Erro de requisição tratado corretamente.");
    aprovados++;
  } catch (error) {
    console.log("REPROVADO: Falha no tratamento de JSON inválido.");
    console.log(error.message);
  }

  // Teste 2: Verifica se o servidor continua funcionando.
  try {
    const resultado = await requisitar("/health");

    if (resultado.status !== 200) {
      throw new Error(`Esperado HTTP 200, recebido HTTP ${resultado.status}.`);
    }

    const dados = JSON.parse(resultado.corpo);

    if (dados.status !== "online") {
      throw new Error("O servidor não informou status online.");
    }

    console.log("APROVADO: Servidor continua funcionando após erro.");
    aprovados++;
  } catch (error) {
    console.log("REPROVADO: Servidor não respondeu corretamente.");
    console.log(error.message);
  }

  // Teste 3: Verifica se o servidor continua aceitando requisições.
  try {
    const resultado = await requisitar("/api/rota-inexistente");

    if (resultado.status !== 404) {
      throw new Error(`Esperado HTTP 404, recebido HTTP ${resultado.status}.`);
    }

    console.log("APROVADO: Servidor continua aceitando novas requisições.");
    aprovados++;
  } catch (error) {
    console.log("REPROVADO: Nova requisição não foi processada.");
    console.log(error.message);
  }

  console.log("\n====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes realizados: 3`);
  console.log(`Testes aprovados: ${aprovados}`);
  console.log(`Testes reprovados: ${3 - aprovados}`);
  console.log("====================================");

  if (aprovados === 3) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    process.exitCode = 1;
  }
}

executarTestes().catch((error) => {
  console.error("ERRO INESPERADO:", error);
  process.exitCode = 1;
});
