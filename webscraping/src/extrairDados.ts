import { load } from "cheerio";
import type { DadosExtraidos } from "./types.js";

// ============================================
// LEADFLOW - EXTRAÇÃO DE DADOS
// ============================================

// ============================================
// EXTRAIR INFORMAÇÕES DO HTML
// ============================================

export function extrairDados(html: string): DadosExtraidos {
  const $ = load(html);

  // Remove elementos que normalmente não contêm
  // informações relevantes sobre a empresa.
  $("script, style, noscript, iframe, svg").remove();

  // Extrai o título da página.
  const titulo = $("title").first().text().trim();

  // Procura a descrição nas metatags.
  const descricao =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  return {
    titulo,
    descricao,
  };
}
