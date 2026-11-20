const http = require("http");

const corpo = JSON.stringify({
  oportunidades: [],
  dadosExtras: "A".repeat(5 * 1024 * 1024),
});

const req = http.request(
  {
    hostname: "localhost",
    port: 3001,
    path: "/api/ranking",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(corpo),
    },
  },
  (res) => {
    let resposta = "";

    res.on("data", (parte) => {
      resposta += parte;
    });

    res.on("end", () => {
      console.log("Status HTTP:", res.statusCode);
      console.log("Resposta:", resposta);
    });
  },
);

req.on("error", (error) => {
  console.log("Conexão encerrada:", error.message);
});

req.write(corpo);
req.end();
