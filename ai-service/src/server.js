require("dotenv").config();

const http = require("http");
const { gerarRanking } = require("./ranking");
const { ErroRequisicao } = require("./erros");

const PORT = Number(process.env.PORT || 3001);

const LIMITE_CORPO = 5 * 1024 * 1024;
const TEMPO_LIMITE_CORPO = 15000;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("A porta configurada no servidor é inválida.");
}

function enviarResposta(res, status, dados) {
  if (res.destroyed || res.writableEnded) {
    return;
  }

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "X-Frame-Options": "DENY",
  });

  res.end(JSON.stringify(dados));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    let tamanho = 0;
    let finalizado = false;

    const temporizador = setTimeout(() => {
      finalizar(
        new ErroRequisicao(
          "Tempo limite para recebimento do corpo excedido.",
          408,
        ),
      );

      req.resume();
    }, TEMPO_LIMITE_CORPO);

    function finalizar(erro, resultado) {
      if (finalizado) return;

      finalizado = true;
      clearTimeout(temporizador);

      if (erro) {
        reject(erro);
      } else {
        resolve(resultado);
      }
    }

    req.on("data", (parte) => {
      if (finalizado) return;

      tamanho += parte.length;

      if (tamanho > LIMITE_CORPO) {
        finalizar(
          new ErroRequisicao(
            "Corpo da requisição muito grande. Limite de 5 MB.",
            413,
          ),
        );

        req.resume();
        return;
      }

      partes.push(parte);
    });

    req.on("end", () => {
      if (finalizado) return;

      try {
        const corpo = Buffer.concat(partes).toString("utf8");

        finalizar(null, JSON.parse(corpo));
      } catch {
        finalizar(
          new ErroRequisicao(
            "O corpo da requisição não contém um JSON válido.",
            400,
          ),
        );
      }
    });

    req.on("aborted", () => {
      finalizar(
        new ErroRequisicao("A requisição foi interrompida pelo cliente.", 400),
      );
    });

    req.on("error", (error) => {
      finalizar(error);
    });

    req.on("close", () => {
      if (!req.complete && !finalizado) {
        finalizar(
          new ErroRequisicao(
            "A conexão foi encerrada antes do recebimento completo.",
            400,
          ),
        );
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return enviarResposta(res, 200, {
      status: "online",
      servico: "LeadFlow AI Service",
    });
  }

  if (req.url === "/api/ranking" && req.method === "POST") {
    try {
      const contentType = req.headers["content-type"] || "";

      if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
        throw new ErroRequisicao(
          "O Content-Type deve ser application/json.",
          415,
        );
      }

      const dados = await lerCorpo(req);

      if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        throw new ErroRequisicao(
          "O corpo da requisição deve ser um objeto JSON.",
        );
      }

      if (!Array.isArray(dados.oportunidades)) {
        throw new ErroRequisicao("O campo oportunidades deve ser um array.");
      }

      const resultado = await gerarRanking(dados.oportunidades);

      return enviarResposta(res, 200, {
        sucesso: true,
        ...resultado,
      });
    } catch (error) {
      if (res.destroyed || res.writableEnded) {
        return;
      }

      console.error("Erro ao gerar ranking:", error.message);

      if (error instanceof ErroRequisicao) {
        return enviarResposta(res, error.status, {
          sucesso: false,
          erro: error.message,
        });
      }

      return enviarResposta(res, 502, {
        sucesso: false,
        erro: "Não foi possível processar o ranking. Tente novamente.",
      });
    }
  }

  if (req.url === "/api/ranking") {
    res.setHeader("Allow", "POST");

    return enviarResposta(res, 405, {
      sucesso: false,
      erro: "Método HTTP não permitido. Utilize POST.",
    });
  }

  return enviarResposta(res, 404, {
    sucesso: false,
    erro: "Endpoint não encontrado.",
  });
});

server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

server.on("error", (error) => {
  console.error("Erro no servidor HTTP:", error.message);
});

server.listen(PORT, () => {
  console.log("==================================");
  console.log("LeadFlow AI Service");
  console.log("==================================");
  console.log(`Servidor executando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Ranking: POST http://localhost:${PORT}/api/ranking`);
});
