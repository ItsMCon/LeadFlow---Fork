// ============================================
// LEADFLOW - TIPOS E INTERFACES
// ============================================

// ============================================
// DADOS EXTRAÍDOS DO HTML
// ============================================

export interface DadosExtraidos {
  titulo: string;
  descricao: string;
}

// ============================================
// DADOS NORMALIZADOS
// ============================================

export interface DadosNormalizados {
  titulo: string;
  descricao: string;
}

// ============================================
// CLASSIFICAÇÃO DE SEGMENTOS
// ============================================

export type Segmento =
  | "Tecnologia"
  | "Consultoria"
  | "Indústria"
  | "Comércio"
  | "Serviços"
  | "Não identificado";

export type NivelConfianca = "alta" | "media" | "baixa";

export interface ResultadoSegmento {
  segmento: Segmento;
  confianca: NivelConfianca;
  palavrasEncontradas: string[];
}

// ============================================
// RESULTADO FINAL DO SCRAPING
// ============================================

export interface DadosEmpresa {
  url: string;
  titulo: string;
  descricao: string;
  segmento: Segmento;
  confiancaSegmento: NivelConfianca;
  palavrasEncontradas: string[];
  dataColeta: string;
}
