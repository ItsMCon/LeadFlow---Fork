// ============================================
// LEADFLOW - CABEÇALHO
// ============================================

// ============================================
// SAUDAÇÃO DO USUÁRIO
// ============================================

function atualizarSaudacao() {
  const elementoSaudacao = document.getElementById("saudacaoUsuario");

  if (!elementoSaudacao) {
    return;
  }

  const horaAtual = new Date().getHours();

  let saudacao;

  if (horaAtual < 12) {
    saudacao = "Bom dia";
  } else if (horaAtual < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  elementoSaudacao.textContent = saudacao;
}

// ============================================
// MENU DO USUÁRIO
// ============================================

function configurarMenuUsuario() {
  const botaoUsuario = document.getElementById("botaoUsuario");
  const menuUsuario = document.getElementById("menuUsuario");

  if (!botaoUsuario || !menuUsuario) {
    return;
  }

  botaoUsuario.addEventListener("click", () => {
    const menuEstaAberto = menuUsuario.classList.toggle("aberto");

    botaoUsuario.setAttribute("aria-expanded", String(menuEstaAberto));
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener("click", (evento) => {
    const clicouNoMenu = menuUsuario.contains(evento.target);
    const clicouNoBotao = botaoUsuario.contains(evento.target);

    if (!clicouNoMenu && !clicouNoBotao) {
      menuUsuario.classList.remove("aberto");
      botaoUsuario.setAttribute("aria-expanded", "false");
    }
  });
}

// ============================================
// INICIALIZAÇÃO DO CABEÇALHO
// ============================================

function iniciarHeader() {
  atualizarSaudacao();
  configurarMenuUsuario();
}

document.addEventListener("DOMContentLoaded", iniciarHeader);
