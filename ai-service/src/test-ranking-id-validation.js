const { gerarRanking } = require("./ranking");

const casos = [
  { nome: "Booleano true", id: true },
  { nome: "Objeto", id: {} },
  { nome: "Array", id: [] },
  { nome: "Zero", id: 0 },
  { nome: "Número negativo", id: -1 },
  { nome: "Número decimal", id: 12.5 },
  { nome: "Texto vazio", id: "   " },
];

async function executarTestes() {
  console.log("TESTES DE VALIDAÇÃO DE IDENTIFICADORES\n");

  for (const caso of casos) {
    try {
      await gerarRanking([
        {
          id: caso.id,
          situacao: "aberta",
        },
      ]);

      console.log(`FALHOU: ${caso.nome} foi aceito.`);
    } catch (error) {
      if (error.message.includes("identificador válido")) {
        console.log(`APROVADO: ${caso.nome} rejeitado.`);
      } else {
        console.log(`ERRO INESPERADO: ${caso.nome}`);
        console.log(error.message);
      }
    }
  }
}

executarTestes();
