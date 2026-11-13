import { Response } from "undici";
import { executarScraping, type RequisicaoHTTP } from "../src/scraper.js";

// ============================================
// LEADFLOW - TESTES DO SCRAPER
// ============================================

const htmlTeste = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>Automind - Tecnologia e Inovação</title>
    <meta
        name="description"
        content="Empresa especializada em soluções tecnológicas, automação de processos e desenvolvimento de software."
    >
</head>
<body>
    <h1>Automind</h1>
    <p>Soluções tecnológicas para empresas.</p>
</body>
</html>
`;

const requisicaoSimulada: RequisicaoHTTP = async () => {
  return new Response(htmlTeste, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

// ============================================
// EXECUÇÃO DOS TESTES
// ============================================

async function executarTestes(): Promise<void> {
  console.log("============================================");
  console.log("LEADFLOW - TESTES DO SCRAPER");
  console.log("============================================");

  let aprovados = 0;
  let total = 0;

  try {
    const resultado = await executarScraping(
      "https://empresa-teste.com.br",
      requisicaoSimulada,
    );

    // Teste 1: URL.
    total++;
    const urlCorreta = resultado.url === "https://empresa-teste.com.br/";

    if (urlCorreta) aprovados++;

    console.log("\nTeste 1 - URL:", urlCorreta ? "APROVADO" : "FALHOU");

    // Teste 2: título.
    total++;
    const tituloCorreto =
      resultado.titulo === "Automind - Tecnologia e Inovação";

    if (tituloCorreto) aprovados++;

    console.log("Teste 2 - Título:", tituloCorreto ? "APROVADO" : "FALHOU");

    // Teste 3: descrição.
    total++;
    const descricaoCorreta =
      resultado.descricao ===
      "Empresa especializada em soluções tecnológicas, automação de processos e desenvolvimento de software.";

    if (descricaoCorreta) aprovados++;

    console.log(
      "Teste 3 - Descrição:",
      descricaoCorreta ? "APROVADO" : "FALHOU",
    );

    // Teste 4: segmento.
    total++;
    const segmentoCorreto = resultado.segmento === "Tecnologia";

    if (segmentoCorreto) aprovados++;

    console.log("Teste 4 - Segmento:", segmentoCorreto ? "APROVADO" : "FALHOU");

    // Teste 5: confiança.
    total++;
    const confiancaCorreta = resultado.confiancaSegmento === "alta";

    if (confiancaCorreta) aprovados++;

    console.log(
      "Teste 5 - Confiança:",
      confiancaCorreta ? "APROVADO" : "FALHOU",
    );

    // Teste 6: palavras encontradas.
    total++;
    const palavrasCorretas =
      resultado.palavrasEncontradas.includes("tecnologia") &&
      resultado.palavrasEncontradas.includes("automacao") &&
      resultado.palavrasEncontradas.includes("desenvolvimento");

    if (palavrasCorretas) aprovados++;

    console.log(
      "Teste 6 - Palavras-chave:",
      palavrasCorretas ? "APROVADO" : "FALHOU",
    );

    // Teste 7: data de coleta.
    total++;
    const dataCorreta = !Number.isNaN(Date.parse(resultado.dataColeta));

    if (dataCorreta) aprovados++;

    console.log(
      "Teste 7 - Data de coleta:",
      dataCorreta ? "APROVADO" : "FALHOU",
    );
  } catch (erro) {
    console.error("\nFalha durante os testes:", erro);
  }

  console.log("\n============================================");
  console.log(`RESULTADO: ${aprovados}/${total} APROVADOS`);
  console.log("============================================");

  if (aprovados !== total) {
    process.exitCode = 1;
  }
}

executarTestes();
