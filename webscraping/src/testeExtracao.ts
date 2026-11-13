import { extrairDados } from "./extrairDados.js";

// ============================================
// LEADFLOW - TESTE DE EXTRAÇÃO DE DADOS
// ============================================

// ============================================
// HTML FICTÍCIO PARA TESTE
// ============================================

const htmlTeste = `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">

    <title>Automind - Tecnologia e Inovação</title>

    <meta
        name="description"
        content="Empresa especializada em soluções tecnológicas e automação de processos."
    >

</head>

<body>

    <h1>Bem-vindo à Automind</h1>

    <p>
        Desenvolvemos soluções tecnológicas para empresas.
    </p>

</body>

</html>
`;

// ============================================
// EXECUÇÃO DO TESTE
// ============================================

console.log("============================================");
console.log("LEADFLOW - TESTE DE EXTRAÇÃO");
console.log("============================================");

const dadosExtraidos = extrairDados(htmlTeste);

// ============================================
// EXIBIÇÃO DOS RESULTADOS
// ============================================

console.log("\nDados extraídos:");

console.log("Título:", dadosExtraidos.titulo);

console.log("Descrição:", dadosExtraidos.descricao);

// ============================================
// VERIFICAÇÃO DOS RESULTADOS
// ============================================

const tituloEsperado = "Automind - Tecnologia e Inovação";

const descricaoEsperada =
  "Empresa especializada em soluções tecnológicas e automação de processos.";

const tituloCorreto = dadosExtraidos.titulo === tituloEsperado;

const descricaoCorreta = dadosExtraidos.descricao === descricaoEsperada;

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
