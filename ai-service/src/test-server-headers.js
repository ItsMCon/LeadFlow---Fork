const http = require("http");

const casos = [
  {
    nome: "Health check",
    metodo: "GET",
    caminho: "/health",
    contentType: true,
    allow: false,
  },
  {
    nome: "Método GET não permitido",
    metodo: "GET",
    caminho: "/api/ranking",
    contentType: true,
    allow: true,
  },
  {
    nome: "Endpoint inexistente",
    metodo: "GET",
    caminho: "/rota-inexistente",
    contentType: true,
    allow: false,
  },
];

function testar(caso) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: caso.caminho,
        method: caso.metodo,
      },
      (res) => {
        res.resume();

        res.on("end", () => {
          resolve({
            status: res.statusCode,
            contentType: res.headers["content-type"],
            allow: res.headers.allow,
          });
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

async function executar() {
  console.log("TESTES DE CABEÇALHOS HTTP\n");

  let aprovados = 0;
  let total = 0;

  for (const caso of casos) {
    const resultado = await testar(caso);

    const tipoCorreto =
      resultado.contentType === "application/json; charset=utf-8";

    const allowCorreto = caso.allow
      ? resultado.allow === "POST"
      : resultado.allow === undefined;

    const aprovado = tipoCorreto && allowCorreto;

    total++;

    if (aprovado) {
      aprovados++;
      console.log(`APROVADO: ${caso.nome}.`);
    } else {
      console.log(`FALHOU: ${caso.nome}.`);
      console.log(resultado);
    }
  }

  console.log(`\nRESULTADO: ${aprovados}/${total} aprovados.`);
}

executar().catch((error) => {
  console.error("Erro durante os testes:", error.message);
});
