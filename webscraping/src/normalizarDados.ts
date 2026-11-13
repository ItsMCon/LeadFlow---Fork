import type { DadosExtraidos, DadosNormalizados } from "./types.js";

// ============================================
// LEADFLOW - NORMALIZAÇÃO DE DADOS
// ============================================

// ============================================
// NORMALIZAR TEXTO
// ============================================

function normalizarTexto(texto: string): string {
  return (
    texto
      // Remove caracteres invisíveis indesejados.
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // Substitui espaços especiais por espaços comuns.
      .replace(/\u00A0/g, " ")

      // Remove espaços repetidos e quebras de linha.
      .replace(/\s+/g, " ")

      // Remove espaços no início e no final.
      .trim()
  );
}

// ============================================
// NORMALIZAR DADOS EXTRAÍDOS
// ============================================

export function normalizarDados(dados: DadosExtraidos): DadosNormalizados {
  return {
    titulo: normalizarTexto(dados.titulo),
    descricao: normalizarTexto(dados.descricao),
  };
}
