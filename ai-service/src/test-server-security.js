const URL_BASE = "http://localhost:3001";

async function executarTeste(nome, oportunidades) {
  console.log(`TESTE - ${nome}`);

  try {
    const resposta = await fetch(`${URL_BASE}/api/ranking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oportunidades }),
    });

    const corpo = await resposta.text();

    if (resposta.status !== 400) {
      throw new Error(
        `Esperado HTTP 400, recebido HTTP ${resposta.status}. Resposta: ${corpo}`,
      );
    }

    console.log("Entrada inválida rejeitada corretamente.");
    console.log("APROVADO.\n");
    return true;
  } catch (error) {
    console.log(`REPROVADO: ${error.message}\n`);
    return false;
  }
}

async function executarTestes() {
  let falhas = 0;

  console.log("TESTES DE SEGURANÇA DO LEADFLOW AI SERVICE\n");

  try {
    const resposta = await fetch(`${URL_BASE}/health`);

    if (!resposta.ok) {
      throw new Error("Servidor indisponível.");
    }
  } catch (error) {
    console.log(`Não foi possível acessar o servidor: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const testes = [
    {
      nome: "Identificador booleano",
      oportunidades: [{ id: true, situacao: "aberta" }],
    },
    {
      nome: "Identificador em formato de objeto",
      oportunidades: [{ id: {}, situacao: "aberta" }],
    },
    {
      nome: "Identificador em formato de array",
      oportunidades: [{ id: [], situacao: "aberta" }],
    },
    {
      nome: "Identificador numérico zero",
      oportunidades: [{ id: 0, situacao: "aberta" }],
    },
    {
      nome: "Oportunidade sem identificador",
      oportunidades: [{ empresa: "Empresa sem ID", situacao: "aberta" }],
    },
    {
      nome: "Oportunidade que não é um objeto",
      oportunidades: ["dados inválidos"],
    },
    {
      nome: "Identificadores duplicados",
      oportunidades: [
        { id: 6001, situacao: "aberta" },
        { id: 6001, situacao: "aberta" },
      ],
    },
    {
      nome: "Situação desconhecida",
      oportunidades: [{ id: 6002, situacao: "status desconhecido" }],
    },
  ];

  for (const teste of testes) {
    const aprovado = await executarTeste(teste.nome, teste.oportunidades);

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
