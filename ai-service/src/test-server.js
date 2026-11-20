async function testarServidor() {
  const oportunidades = [
    {
      id: 1,
      empresa: "Empresa A",
      segmento: "Tecnologia",
      decisor: "Diretor de TI",
      observacoes: "Demonstrou interesse em automação.",
      situacao: "Aberta",
      scraping: {
        sinais: "Empresa está expandindo sua infraestrutura tecnológica.",
      },
    },
    {
      id: 2,
      empresa: "Empresa B",
      segmento: "Varejo",
      decisor: "Gerente",
      observacoes: "Ainda não foram identificadas necessidades específicas.",
      situacao: "Aberta",
    },
    {
      id: 3,
      empresa: "Empresa C",
      segmento: "Indústria",
      decisor: "Diretor",
      observacoes: "Solicitou proposta para modernização.",
      situacao: "Aberta",
      scraping: {
        sinais: "Empresa confirmou investimentos em modernização.",
      },
    },
    {
      id: 4,
      empresa: "Empresa D",
      segmento: "Serviços",
      situacao: "Perdida",
    },
  ];

  try {
    const response = await fetch("http://localhost:3001/api/ranking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oportunidades }),
    });

    const resultado = await response.json();

    console.log("STATUS HTTP:", response.status);
    console.log("\nRESULTADO:");

    console.log(JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error("Erro ao conectar ao AI Service:", error.message);
  }
}

testarServidor();
