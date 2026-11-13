import type {
  DadosNormalizados,
  Segmento,
  ResultadoSegmento,
} from "./types.js";

// ============================================
// LEADFLOW - IDENTIFICAÇÃO DE SEGMENTO
// ============================================

// Palavras-chave associadas a cada segmento.
const PALAVRAS_CHAVE: Record<
  Exclude<Segmento, "Não identificado">,
  string[]
> = {
  Tecnologia: [
    "tecnologia",
    "software",
    "sistema",
    "desenvolvimento",
    "programacao",
    "automacao",
    "inteligencia artificial",
    "dados",
    "informatica",
  ],

  Consultoria: [
    "consultoria",
    "consultor",
    "assessoria",
    "gestao empresarial",
    "planejamento estrategico",
  ],

  Indústria: [
    "industria",
    "fabricacao",
    "producao industrial",
    "manufatura",
    "fabrica",
  ],

  Comércio: [
    "comercio",
    "varejo",
    "atacado",
    "loja",
    "distribuidora",
    "e-commerce",
  ],

  Serviços: [
    "servicos",
    "manutencao",
    "instalacao",
    "transporte",
    "logistica",
    "limpeza",
  ],
};

// ============================================
// PREPARAR TEXTO PARA CLASSIFICAÇÃO
// ============================================

function prepararTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// ============================================
// IDENTIFICAR SEGMENTO
// ============================================

export function identificarSegmento(
  dados: DadosNormalizados,
): ResultadoSegmento {
  const texto = prepararTexto(`${dados.titulo} ${dados.descricao}`);

  const pontuacoes: Record<string, string[]> = {};

  for (const [segmento, palavras] of Object.entries(PALAVRAS_CHAVE)) {
    const encontradas = palavras.filter((palavra) =>
      texto.includes(prepararTexto(palavra)),
    );

    pontuacoes[segmento] = encontradas;
  }

  // Ordena os segmentos pela quantidade de palavras encontradas.
  const classificacao = Object.entries(pontuacoes).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const [melhorSegmento, melhoresPalavras] = classificacao[0];

  // Nenhuma palavra-chave foi encontrada.
  if (melhoresPalavras.length === 0) {
    return {
      segmento: "Não identificado",
      confianca: "baixa",
      palavrasEncontradas: [],
    };
  }

  // Verifica se existe empate entre segmentos.
  const empate =
    classificacao.length > 1 &&
    classificacao[1][1].length === melhoresPalavras.length;

  if (empate) {
    return {
      segmento: "Não identificado",
      confianca: "baixa",
      palavrasEncontradas: melhoresPalavras,
    };
  }

  // Define a confiança de acordo com as evidências.
  const confianca =
    melhoresPalavras.length >= 3
      ? "alta"
      : melhoresPalavras.length === 2
        ? "media"
        : "baixa";

  return {
    segmento: melhorSegmento as Segmento,
    confianca,
    palavrasEncontradas: melhoresPalavras,
  };
}
