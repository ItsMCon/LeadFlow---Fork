const http = require("http");

const casos = [
  { metodo: "GET", esperado: 405 },
  { metodo: "PUT", esperado: 405 },
  { metodo: "DELETE", esperado: 405 },
  { metodo: "PATCH", esperado: 405 },
];

async function testarMetodo(caso) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/ranking",
        method: caso.metodo,
      },
      (res) => {
        res.resume();

        res.on("end", () => {
          resolve(res.statusCode);
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

async function executar() {
  console.log("TESTES DE MÉTODOS HTTP\n");

  let aprovados = 0;

  for (const caso of casos) {
    try {
      const status = await testarMetodo(caso);

      if (status === caso.esperado) {
        console.log(`APROVADO: ${caso.metodo} retornou HTTP ${status}.`);
        aprovados++;
      } else {
        console.log(`FALHOU: ${caso.metodo} retornou HTTP ${status}.`);
      }
    } catch (error) {
      console.log(`ERRO: ${caso.metodo}: ${error.message}`);
    }
  }

  console.log(`\nRESULTADO: ${aprovados}/${casos.length} aprovados.`);
}

executar();
