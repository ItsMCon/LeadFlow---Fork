"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarDados = normalizarDados;
// ============================================
// LEADFLOW - NORMALIZAÇÃO DE DADOS
// ============================================
// ============================================
// NORMALIZAR TEXTO
// ============================================
function normalizarTexto(texto) {
    return (texto
        // Remove caracteres invisíveis indesejados.
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        // Substitui espaços especiais por espaços comuns.
        .replace(/\u00A0/g, " ")
        // Remove espaços repetidos e quebras de linha.
        .replace(/\s+/g, " ")
        // Remove espaços no início e no final.
        .trim());
}
// ============================================
// NORMALIZAR DADOS EXTRAÍDOS
// ============================================
function normalizarDados(dados) {
    return {
        titulo: normalizarTexto(dados.titulo),
        descricao: normalizarTexto(dados.descricao),
    };
}
