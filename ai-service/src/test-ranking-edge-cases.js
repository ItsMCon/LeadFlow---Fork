const { gerarRanking } = require("./ranking");

// Teste 1: oportunidade sem informações de web scraping.
const testeSemScraping = [
  {
    id: 101,
    empresa: "Empresa E",
    nicho: "Tecnologia",
    cidade: "Rio de Janeiro",
    decisor: "Pedro Silva",
    cargo: "Diretor",
    email: "pedro@empresae.com",
    telefone: "21999999999",
    observacoes: "Demonstrou interesse em soluções de automação.",
    situacao: "Aberta",
  },
];

// Teste 2: oportunidade com vários campos vazios.
const testeDadosIncompletos = [
  {
    id: 102,
    empresa: "Empresa F",
    nicho: "",
    cidade: "",
    decisor: "",
    cargo: "",
    email: "",
    telefone: "",
    observacoes: "",
    situacao: "Aberta",
  },
];

// Teste 3: nenhuma oportunidade aberta.
const testeSemOportunidadesAbertas = [
  {
    id: 103,
    empresa: "Empresa G",
    situacao: "Perdida",
  },
  {
    id: 104,
    empresa: "Empresa H",
    situacao: "Concluída",
  },
];

async function executarTeste(nome, oportunidades) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(nome);
  console.log("=".repeat(60));

  try {
    const resultado = await gerarRanking(oportunidades);

    console.log("Teste executado com sucesso.");
    console.log("Resultado:");

    console.table(resultado.ranking);
  } catch (error) {
    console.error("Erro no teste:", error.message);
  }
}

async function executarTestes() {
  console.log("INICIANDO TESTES DE ROBUSTEZ DO RANKING");

  await executarTeste(
    "TESTE 1 - Oportunidade sem web scraping",
    testeSemScraping,
  );

  await executarTeste(
    "TESTE 2 - Oportunidade com dados incompletos",
    testeDadosIncompletos,
  );

  await executarTeste(
    "TESTE 3 - Nenhuma oportunidade aberta",
    testeSemOportunidadesAbertas,
  );

  console.log("\nTESTES DE ROBUSTEZ FINALIZADOS.");
}

executarTestes();
