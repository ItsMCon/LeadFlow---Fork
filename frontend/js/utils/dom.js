// ============================================
// LEADFLOW - UTILITÁRIOS DO DOM
// ============================================

// ============================================
// SELECIONAR ELEMENTOS HTML
// ============================================

// Seleciona um único elemento.
function selecionarElemento(seletor, elementoPai = document) {
  return elementoPai.querySelector(seletor);
}

// Seleciona todos os elementos correspondentes.
function selecionarElementos(seletor, elementoPai = document) {
  return elementoPai.querySelectorAll(seletor);
}

// ============================================
// MANIPULAR TEXTO E CONTEÚDO
// ============================================

// Altera o texto de um elemento.
function alterarTexto(seletor, texto) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.textContent = texto;
}

// Altera o conteúdo HTML de um elemento.
function alterarConteudo(seletor, conteudo) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.innerHTML = conteudo;
}

// ============================================
// EXIBIR E OCULTAR ELEMENTOS
// ============================================

// Exibe um elemento.
function exibirElemento(seletor) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.hidden = false;
}

// Oculta um elemento.
function ocultarElemento(seletor) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.hidden = true;
}

// Alterna entre exibir e ocultar.
function alternarVisibilidade(seletor) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.hidden = !elemento.hidden;
}

// ============================================
// MANIPULAR CLASSES CSS
// ============================================

// Adiciona uma classe.
function adicionarClasse(seletor, classe) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.classList.add(classe);
}

// Remove uma classe.
function removerClasse(seletor, classe) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.classList.remove(classe);
}

// Alterna uma classe.
function alternarClasse(seletor, classe) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  return elemento.classList.toggle(classe);
}

// ============================================
// MANIPULAR CAMPOS DE FORMULÁRIO
// ============================================

// Obtém o valor de um campo.
function obterValorCampo(seletor) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return "";

  return elemento.value;
}

// Altera o valor de um campo.
function definirValorCampo(seletor, valor) {
  const elemento = selecionarElemento(seletor);

  if (!elemento) return;

  elemento.value = valor;
}

// Limpa um formulário.
function limparFormulario(seletor) {
  const formulario = selecionarElemento(seletor);

  if (!formulario) return;

  formulario.reset();
}

// ============================================
// CRIAR ELEMENTOS HTML
// ============================================

// Cria um elemento HTML com uma classe opcional.
function criarElemento(tag, classe = "") {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  return elemento;
}

// ============================================
// VERIFICAR EXISTÊNCIA DE ELEMENTOS
// ============================================

function elementoExiste(seletor) {
  return selecionarElemento(seletor) !== null;
}
