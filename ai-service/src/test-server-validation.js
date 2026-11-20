const URL_BASE = "http://localhost:3001";

async function executarTeste(nome, requisicao, statusEsperado) {
  console.log(`TESTE - ${nome}`);

  try {
    const resposta = await fetch(requisicao.url, requisicao.opcoes);
    const corpo = await resposta.text();

    if (resposta.status !== statusEsperado) {
      throw new Error(
        `Esperado HTTP ${statusEsperado}, recebido HTTP ${resposta.status}. Resposta: ${corpo}`,
      );
    }

    console.log(`HTTP ${resposta.status} recebido corretamente.`);
    console.log("APROVADO.\n");
    return true;
  } catch (error) {
    console.log(`REPROVADO: ${error.message}\n`);
    return false;
  }
}

async function executarTestes() {
  let falhas = 0;

  console.log("TESTES DE VALIDAÇÃO DA API REST\n");

  // Verifica se o servidor está disponível.
  try {
    const resposta = await fetch(`${URL_BASE}/health`);

    if (!resposta.ok) {
      throw new Error(`Servidor respondeu HTTP ${resposta.status}.`);
    }
  } catch (error) {
    console.log("Não foi possível acessar o servidor.");
    console.log(
      "Inicie o server.js em outro terminal antes de executar este teste.",
    );
    console.log(`Detalhes: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const testes = [
    {
      nome: "Método GET não permitido na rota de ranking",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: { method: "GET" },
      },
      status: 405,
    },
    {
      nome: "Método PUT não permitido na rota de ranking",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: { method: "PUT" },
      },
      status: 405,
    },
    {
      nome: "Corpo da requisição vazio",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "",
        },
      },
      status: 400,
    },
    {
      nome: "JSON malformado",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: '{"oportunidades": [',
        },
      },
      status: 400,
    },
    {
      nome: "Campo oportunidades ausente",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      },
      status: 400,
    },
    {
      nome: "Campo oportunidades com tipo incorreto",
      requisicao: {
        url: `${URL_BASE}/api/ranking`,
        opcoes: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oportunidades: "não é uma lista",
          }),
        },
      },
      status: 400,
    },
    {
      nome: "Rota inexistente",
      requisicao: {
        url: `${URL_BASE}/api/rota-inexistente`,
        opcoes: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      },
      status: 404,
    },
  ];

  for (const teste of testes) {
    const aprovado = await executarTeste(
      teste.nome,
      teste.requisicao,
      teste.status,
    );

    if (!aprovado) {
      falhas++;
    }
  }

  console.log("====================================");
  console.log("RESULTADO FINAL");
  console.log(`Testes realizados: ${testes.length}`);
  console.log(`Testes com falha: ${falhas}`);
  console.log("====================================");

  if (falhas === 0) {
    console.log("TODOS OS TESTES PASSARAM.");
  } else {
    console.log("ALGUNS TESTES FALHARAM.");
    process.exitCode = 1;
  }
}

executarTestes().catch((error) => {
  console.error("ERRO INESPERADO:", error);
  process.exitCode = 1;
});
