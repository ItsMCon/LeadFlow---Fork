const http = require("http");

const casos = [
  {
    nome: "Health check",
    metodo: "GET",
    caminho: "/health",
    corpo: null,
    status: 200,
  },
  {
    nome: "JSON inválido",
    metodo: "POST",
    caminho: "/api/ranking",
    corpo: "{json-invalido",
    status: 400,
  },
  {
    nome: "Oportunidades ausentes",
    metodo: "POST",
    caminho: "/api/ranking",
    corpo: "{}",
    status: 400,
  },
  {
    nome: "Método não permitido",
    metodo: "GET",
    caminho: "/api/ranking",
    corpo: null,
    status: 405,
  },
  {
    nome: "Endpoint inexistente",
    metodo: "GET",
    caminho: "/inexistente",
    corpo: null,
    status: 404,
  },
];

function testar(caso) {
  return new Promise((resolve, reject) => {
    const opcoes = {
      hostname: "localhost",
      port: 3001,
      path: caso.caminho,
      method: caso.metodo,
      headers: {},
    };

    if (caso.corpo !== null) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.headers["Content-Length"] = Buffer.byteLength(caso.corpo);
    }

    const req = http.request(opcoes, (res) => {
      let resposta = "";

      res.on("data", (parte) => {
        resposta += parte;
      });

      res.on("end", () => {
        let jsonValido = false;

        try {
          JSON.parse(resposta);
          jsonValido = true;
        } catch {}

        resolve({
          status: res.statusCode,
          jsonValido,
        });
      });
    });

    req.on("error", reject);

    if (caso.corpo !== null) {
      req.write(caso.corpo);
    }

    req.end();
  });
}

async function executar() {
  console.log("TESTES DE INTEGRIDADE DAS RESPOSTAS HTTP\n");

  let aprovados = 0;

  for (const caso of casos) {
    const resultado = await testar(caso);

    if (resultado.status === caso.status && resultado.jsonValido) {
      console.log(`APROVADO: ${caso.nome}.`);
      aprovados++;
    } else {
      console.log(`FALHOU: ${caso.nome}.`);
      console.log(resultado);
    }
  }

  console.log(`\nRESULTADO: ${aprovados}/${casos.length} aprovados.`);
}

executar().catch((error) => {
  console.error("Erro durante os testes:", error.message);
});
