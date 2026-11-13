// ============================================
// LEADFLOW - FORMATADORES DE DADOS
// ============================================

// ============================================
// FORMATAR DATAS
// ============================================

// Converte uma data para o formato brasileiro (DD/MM/AAAA).
function formatarData(data) {
  if (!data) return "";

  const dataConvertida = new Date(data);

  if (isNaN(dataConvertida.getTime())) {
    return "";
  }

  return dataConvertida.toLocaleDateString("pt-BR");
}

// Formata uma data com horário.
function formatarDataHora(data) {
  if (!data) return "";

  const dataConvertida = new Date(data);

  if (isNaN(dataConvertida.getTime())) {
    return "";
  }

  return dataConvertida.toLocaleString("pt-BR");
}

// ============================================
// FORMATAR VALORES MONETÁRIOS
// ============================================

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "";
  }

  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico)) {
    return "";
  }

  return valorNumerico.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ============================================
// FORMATAR TELEFONES
// ============================================

function formatarTelefone(telefone) {
  if (!telefone) return "";

  const numeros = String(telefone).replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (numeros.length === 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return telefone;
}

// ============================================
// FORMATAR CPF E CNPJ
// ============================================

function formatarCPF(cpf) {
  if (!cpf) return "";

  const numeros = String(cpf).replace(/\D/g, "");

  if (numeros.length !== 11) return cpf;

  return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function formatarCNPJ(cnpj) {
  if (!cnpj) return "";

  const numeros = String(cnpj).replace(/\D/g, "");

  if (numeros.length !== 14) return cnpj;

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

// ============================================
// FORMATAR TEXTOS
// ============================================

// Remove espaços desnecessários no início e no final.
function formatarTexto(texto) {
  if (texto === null || texto === undefined) {
    return "";
  }

  return String(texto).trim();
}

// Coloca a primeira letra de cada palavra em maiúsculo.
function formatarNome(texto) {
  if (!texto) return "";

  return String(texto)
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letra) => letra.toUpperCase());
}

// ============================================
// FORMATAR STATUS E PRIORIDADE
// ============================================

function formatarStatus(status) {
  if (!status) return "";

  const statusFormatado = {
    novo: "Novo",
    contato: "Em contato",
    qualificacao: "Em qualificação",
    convertido: "Convertido",
    perdido: "Perdido",
  };

  return statusFormatado[status] || status;
}

function formatarPrioridade(prioridade) {
  if (!prioridade) return "";

  const prioridadesFormatadas = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };

  return prioridadesFormatadas[prioridade] || prioridade;
}

// ============================================
// FORMATAR NÚMEROS
// ============================================

function formatarNumero(numero) {
  if (numero === null || numero === undefined || numero === "") {
    return "";
  }

  const valorNumerico = Number(numero);

  if (!Number.isFinite(valorNumerico)) {
    return "";
  }

  return valorNumerico.toLocaleString("pt-BR");
}

// Formata números como porcentagem.
function formatarPorcentagem(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "";
  }

  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico)) {
    return "";
  }

  return `${valorNumerico.toLocaleString("pt-BR")}%`;
}
