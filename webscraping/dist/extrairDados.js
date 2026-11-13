"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extrairDados = extrairDados;
const cheerio_1 = require("cheerio");
// ============================================
// LEADFLOW - EXTRAÇÃO DE DADOS
// ============================================
// ============================================
// EXTRAIR INFORMAÇÕES DO HTML
// ============================================
function extrairDados(html) {
    const $ = (0, cheerio_1.load)(html);
    // Remove elementos que normalmente não contêm
    // informações relevantes sobre a empresa.
    $("script, style, noscript, iframe, svg").remove();
    // Extrai o título da página.
    const titulo = $("title").first().text().trim();
    // Procura a descrição nas metatags.
    const descricao = $('meta[name="description"]').attr("content")?.trim() ||
        $('meta[property="og:description"]').attr("content")?.trim() ||
        "";
    return {
        titulo,
        descricao,
    };
}
