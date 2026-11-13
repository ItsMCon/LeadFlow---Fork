// ============================================
// LEADFLOW - VALIDADORES DE DADOS
// ============================================

// ============================================
// VALIDAÇÕES GERAIS
// ============================================

// Verifica se um valor foi preenchido.
function campoObrigatorio(valor) {
  return valor !== null && valor !== undefined && String(valor).trim() !== "";
}

// Verifica se um valor contém apenas números.
function somenteNumeros(valor) {
  if (!campoObrigatorio(valor)) return false;

  return /^\d+$/.test(String(valor));
}

// Verifica o tamanho mínimo de um texto.
function tamanhoMinimo(valor, minimo) {
  if (!campoObrigatorio(valor)) return false;

  return String(valor).trim().length >= minimo;
}

// Verifica o tamanho máximo de um texto.
function tamanhoMaximo(valor, maximo) {
  if (!campoObrigatorio(valor)) return false;

  return String(valor).trim().length <= maximo;
}

// ============================================
// VALIDAR E-MAIL
// ============================================

function validarEmail(email) {
  if (!campoObrigatorio(email)) return false;

  const expressaoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return expressaoEmail.test(String(email).trim());
}

// ============================================
// VALIDAR TELEFONE
// ============================================

function validarTelefone(telefone) {
  if (!campoObrigatorio(telefone)) return false;

  const numeros = String(telefone).replace(/\D/g, "");

  // Aceita telefones brasileiros com DDD.
  return numeros.length === 10 || numeros.length === 11;
}

// ============================================
// VALIDAR CPF
// ============================================

function validarCPF(cpf) {
  if (!campoObrigatorio(cpf)) return false;

  const numeros = String(cpf).replace(/\D/g, "");

  if (numeros.length !== 11) return false;

  // Rejeita sequências repetidas.
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  // Calcula o primeiro dígito verificador.
  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(numeros[9])) return false;

  // Calcula o segundo dígito verificador.
  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === Number(numeros[10]);
}

// ============================================
// VALIDAR CNPJ
// ============================================

function validarCNPJ(cnpj) {
  if (!campoObrigatorio(cnpj)) return false;

  const numeros = String(cnpj).replace(/\D/g, "");

  if (numeros.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(numeros)) return false;

  const calcularDigito = (base, pesos) => {
    let soma = 0;

    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }

    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(
    numeros.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  if (primeiroDigito !== Number(numeros[12])) return false;

  const segundoDigito = calcularDigito(
    numeros.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return segundoDigito === Number(numeros[13]);
}

// ============================================
// VALIDAR SENHA
// ============================================

function validarSenha(senha) {
  if (!campoObrigatorio(senha)) return false;

  // Exige pelo menos 8 caracteres.
  return String(senha).length >= 8;
}

// ============================================
// VALIDAR CAMPOS DE UM LEAD
// ============================================

function validarDadosLead(dados) {
  const erros = [];

  // Nome do contato.
  if (!campoObrigatorio(dados.nome)) {
    erros.push("O nome do contato é obrigatório.");
  }

  // Empresa.
  if (!campoObrigatorio(dados.empresa)) {
    erros.push("O nome da empresa é obrigatório.");
  }

  // E-mail.
  if (!campoObrigatorio(dados.email)) {
    erros.push("O e-mail é obrigatório.");
  } else if (!validarEmail(dados.email)) {
    erros.push("O e-mail informado é inválido.");
  }

  // Telefone.
  if (!campoObrigatorio(dados.telefone)) {
    erros.push("O telefone é obrigatório.");
  } else if (!validarTelefone(dados.telefone)) {
    erros.push("O telefone informado é inválido.");
  }

  // Segmento.
  if (!campoObrigatorio(dados.segmento)) {
    erros.push("O segmento da empresa é obrigatório.");
  }

  // Origem.
  if (!campoObrigatorio(dados.origem)) {
    erros.push("A origem do lead é obrigatória.");
  }

  return erros;
}

// ============================================
// VALIDAR DADOS DE LOGIN
// ============================================

function validarDadosLogin(email, senha) {
  const erros = [];

  if (!campoObrigatorio(email)) {
    erros.push("O e-mail é obrigatório.");
  } else if (!validarEmail(email)) {
    erros.push("O e-mail informado é inválido.");
  }

  if (!campoObrigatorio(senha)) {
    erros.push("A senha é obrigatória.");
  }

  return erros;
}
