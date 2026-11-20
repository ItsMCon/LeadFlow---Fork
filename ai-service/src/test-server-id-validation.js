const http = require("http");

const casos = [
  { nome: "Booleano true", id: true },
  { nome: "Objeto", id: {} },
  { nome: "Array", id: [] },
  { nome: "Zero", id: 0 },
];

async function testar(caso) {
  const dados = JSON.stringify({
    oportunidades: [
      {
        id: caso.id,
        situacao: "aberta",
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/ranking",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dados),
        },
      },
      (res) => {
        let corpo = "";

        res.on("data", (parte) => {
          corpo += parte;
        });

        res.on("end", () => {
          resolve({
            status: res.statusCode,
            resposta: corpo,
          });
        });
      },
    );

    req.on("error", reject);
    req.write(dados);
    req.end();
  });
}

async function executar() {
  console.log("TESTE DE VALIDAÇÃO PELO SERVIDOR HTTP\n");

  for (const caso of casos) {
    try {
      const resultado = await testar(caso);

      if (resultado.status === 400) {
        console.log(`APROVADO: ${caso.nome} rejeitado pelo servidor.`);
      } else {
        console.log(`FALHOU: ${caso.nome}`);
        console.log("Status:", resultado.status);
        console.log("Resposta:", resultado.resposta);
      }
    } catch (error) {
      console.log(`ERRO: ${caso.nome}`);
      console.log(error.message);
    }
  }
}

executar();
