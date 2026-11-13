import { identificarSegmento } from "./identificarSegmento.js";
import type { DadosNormalizados, Segmento } from "./types.js";

// ============================================
// LEADFLOW - TESTE DE IDENTIFICAÇÃO DE SEGMENTO
// ============================================

// ============================================
// CASOS DE TESTE
// ============================================

const casosTeste: {
  nome: string;
  dados: DadosNormalizados;
  esperado: Segmento;
}[] = [
  {
    nome: "Empresa de tecnologia",
    dados: {
      titulo: "Automind - Tecnologia e Inovação",
      descricao:
        "Empresa especializada em soluções tecnológicas, automação de processos e desenvolvimento de software.",
    },
    esperado: "Tecnologia",
  },

  {
    nome: "Empresa de consultoria",
    dados: {
      titulo: "Consultoria Empresarial",
      descricao: "Assessoria em gestão empresarial e planejamento estratégico.",
    },
    esperado: "Consultoria",
  },

  {
    nome: "Empresa industrial",
    dados: {
      titulo: "Indústria de Manufatura",
      descricao: "Empresa especializada em fabricação e produção industrial.",
    },
    esperado: "Indústria",
  },

  {
    nome: "Empresa sem segmento identificável",
    dados: {
      titulo: "Empresa ABC",
      descricao: "Bem-vindo ao nosso site institucional.",
    },
    esperado: "Não identificado",
  },
];

// ============================================
// EXECUÇÃO DOS TESTES
// ============================================

console.log("============================================");
console.log("LEADFLOW - TESTE DE IDENTIFICAÇÃO");
console.log("============================================");

let aprovados = 0;

for (const caso of casosTeste) {
  const resultado = identificarSegmento(caso.dados);

  const aprovado = resultado.segmento === caso.esperado;

  if (aprovado) {
    aprovados++;
  }

  console.log(`\nTeste: ${caso.nome}`);
  console.log("Segmento:", resultado.segmento);
  console.log("Confiança:", resultado.confianca);
  console.log("Palavras encontradas:", resultado.palavrasEncontradas);
  console.log("Resultado:", aprovado ? "APROVADO" : "FALHOU");
}

// ============================================
// RESULTADO FINAL
// ============================================

console.log("\n============================================");
console.log(`RESULTADO: ${aprovados}/${casosTeste.length} APROVADOS`);
console.log("============================================");
