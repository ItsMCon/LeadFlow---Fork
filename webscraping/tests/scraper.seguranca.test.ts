import { Response } from "undici";
import { executarScraping, type RequisicaoHTTP } from "../src/scraper.js";

const urlsBloqueadas = [
  "http://localhost",
  "http://api.localhost",
  "http://127.0.0.1",
  "http://10.0.0.1",
  "http://172.16.0.1",
  "http://192.168.1.1",
  "http://169.254.169.254",
  "http://[::1]",
  "http://[fc00::1]",
  "http://[fe80::1]",
  "http://[::ffff:127.0.0.1]",
];

async function testarSeguranca(): Promise<void> {
  let aprovados = 0;

  console.log("================================");
  console.log("TESTES DE SEGURANÇA - LEADFLOW");
  console.log("================================\n");

  for (const url of urlsBloqueadas) {
    let fetchFoiChamado = false;

    const requisicaoSimulada: RequisicaoHTTP = async () => {
      fetchFoiChamado = true;

      return new Response("<html></html>", {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    };

    try {
      await executarScraping(url, requisicaoSimulada);

      console.error(`FALHOU: ${url} não foi bloqueada.`);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);

      const bloqueouURL = mensagem.includes("não é permitido");

      if (bloqueouURL && !fetchFoiChamado) {
        console.log(`APROVADO: ${url}`);
        aprovados++;
      } else {
        console.error(`FALHOU: ${url}`);
        console.error(`Motivo: ${mensagem}`);

        if (fetchFoiChamado) {
          console.error("A requisição chegou a ser chamada.");
        }
      }
    }
  }

  console.log("\n================================");
  console.log(`${aprovados}/${urlsBloqueadas.length} testes aprovados.`);
  console.log("================================");

  if (aprovados !== urlsBloqueadas.length) {
    process.exitCode = 1;
  }
}

testarSeguranca();
