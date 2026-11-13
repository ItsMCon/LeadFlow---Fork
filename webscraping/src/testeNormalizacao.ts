import { normalizarDados } from "./normalizarDados.js";
import type { DadosExtraidos } from "./types.js";

// ============================================
// LEADFLOW - TESTE DE NORMALIZAÇÃO
// ============================================

// ============================================
// DADOS FICTÍCIOS PARA TESTE
// ============================================

const dadosTeste: DadosExtraidos = {
  titulo: "   Automind     -   Tecnologia   ",
  descricao: "Empresa   especializada\n\n em   soluções\t tecnológicas.",
};

// ============================================
// EXECUÇÃO DA NORMALIZAÇÃO
// ============================================

console.log("============================================");
console.log("LEADFLOW - TESTE DE NORMALIZAÇÃO");
console.log("============================================");

const dadosNormalizados = normalizarDados(dadosTeste);

// ============================================
// EXIBIÇÃO DOS RESULTADOS
// ============================================

console.log("\nDados originais:");
console.log("Título:", JSON.stringify(dadosTeste.titulo));
console.log("Descrição:", JSON.stringify(dadosTeste.descricao));

console.log("\nDados normalizados:");
console.log("Título:", JSON.stringify(dadosNormalizados.titulo));
console.log("Descrição:", JSON.stringify(dadosNormalizados.descricao));

// ============================================
// VERIFICAÇÃO DOS RESULTADOS
// ============================================

const tituloEsperado = "Automind - Tecnologia";

const descricaoEsperada = "Empresa especializada em soluções tecnológicas.";

const tituloCorreto = dadosNormalizados.titulo === tituloEsperado;

const descricaoCorreta = dadosNormalizados.descricao === descricaoEsperada;

console.log("\n============================================");
console.log("RESULTADO DOS TESTES");
console.log("============================================");

console.log("Título:", tituloCorreto ? "APROVADO" : "FALHOU");

console.log("Descrição:", descricaoCorreta ? "APROVADO" : "FALHOU");

if (tituloCorreto && descricaoCorreta) {
  console.log("\nTodos os testes foram aprovados!");
} else {
  console.log("\nUm ou mais testes falharam.");
}
