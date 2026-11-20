const { gerarRanking } = require("./ranking");

const opportunities = [
  {
    id: 1,
    empresa: "Empresa A",
    nicho: "Tecnologia",
    cidade: "Rio de Janeiro",
    decisor: "Carlos Mendes",
    cargo: "Diretor de TI",
    email: "carlos@alfa.com",
    telefone: "21999999999",
    observacoes: "Empresa demonstrou interesse em automatizar processos.",
    situacao: "Aberta",
    scraping: {
      informacoes: "Empresa anunciou expansão e abertura de novas unidades.",
    },
  },
  {
    id: 2,
    empresa: "Empresa B",
    nicho: "Varejo",
    cidade: "Niterói",
    decisor: "Mariana Costa",
    cargo: "Gerente",
    email: "",
    telefone: "",
    observacoes: "Ainda não houve contato.",
    situacao: "Aberta",
    scraping: {
      informacoes:
        "Empresa possui presença regional, sem sinais recentes de expansão.",
    },
  },
  {
    id: 3,
    empresa: "Empresa C",
    nicho: "Indústria",
    cidade: "Macaé",
    decisor: "Roberto Lima",
    cargo: "Diretor",
    email: "roberto@gama.com",
    telefone: "22988888888",
    observacoes: "Solicitou proposta comercial para modernização da operação.",
    situacao: "Aberta",
    scraping: {
      informacoes: "Empresa divulgou investimento em modernização industrial.",
    },
  },
  {
    id: 4,
    empresa: "Empresa D",
    nicho: "Serviços",
    cidade: "Cabo Frio",
    decisor: "Ana Souza",
    cargo: "Coordenadora",
    email: "ana@delta.com",
    telefone: "22977777777",
    observacoes: "Oportunidade encerrada sem contratação.",
    situacao: "Perdida",
    scraping: {
      informacoes: "Empresa continua operando normalmente.",
    },
  },
];

async function testRanking() {
  try {
    console.log("Gerando ranking...\n");

    const resultado = await gerarRanking(opportunities);

    console.log("Ranking gerado:\n");
    console.table(resultado.ranking);
  } catch (error) {
    console.error("Erro no teste:", error.message);
  }
}

testRanking();
