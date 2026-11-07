// ============================================
// LEADFLOW - PÁGINA DE LOGIN
// ============================================

// ============================================
// ELEMENTOS DO LOGIN
// ============================================

function obterElementosLogin() {
  return {
    formulario: document.getElementById("formularioLogin"),
    email: document.getElementById("emailLogin"),
    senha: document.getElementById("senhaLogin"),
    botaoEntrar: document.getElementById("botaoEntrar"),
    botaoMostrarSenha: document.getElementById("botaoMostrarSenha"),
    mensagemErro: document.getElementById("mensagemErro"),
    mensagemSucesso: document.getElementById("mensagemSucesso"),
  };
}

// ============================================
// EXIBIÇÃO DE MENSAGENS
// ============================================

function exibirMensagemLogin(tipo, mensagem) {
  const elementos = obterElementosLogin();

  const elemento =
    tipo === "erro" ? elementos.mensagemErro : elementos.mensagemSucesso;

  const outroElemento =
    tipo === "erro" ? elementos.mensagemSucesso : elementos.mensagemErro;

  if (outroElemento) {
    outroElemento.textContent = "";
    outroElemento.hidden = true;
  }

  if (!elemento) {
    console.warn(mensagem);
    return;
  }

  elemento.textContent = mensagem;
  elemento.hidden = false;
}

// ============================================
// LIMPEZA DAS MENSAGENS
// ============================================

function limparMensagensLogin() {
  const elementos = obterElementosLogin();

  if (elementos.mensagemErro) {
    elementos.mensagemErro.textContent = "";
    elementos.mensagemErro.hidden = true;
  }

  if (elementos.mensagemSucesso) {
    elementos.mensagemSucesso.textContent = "";
    elementos.mensagemSucesso.hidden = true;
  }
}

// ============================================
// VALIDAÇÃO DOS CAMPOS
// ============================================

function validarDadosLogin(email, senha) {
  const erros = [];

  if (!email) {
    erros.push("Informe seu e-mail.");
  } else {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
      erros.push("Informe um e-mail válido.");
    }
  }

  if (!senha) {
    erros.push("Informe sua senha.");
  }

  return erros;
}

// ============================================
// VISIBILIDADE DA SENHA
// ============================================

function configurarVisibilidadeSenha() {
  const elementos = obterElementosLogin();

  if (!elementos.botaoMostrarSenha || !elementos.senha) {
    return;
  }

  elementos.botaoMostrarSenha.addEventListener("click", () => {
    const senhaEstaOculta = elementos.senha.type === "password";

    elementos.senha.type = senhaEstaOculta ? "text" : "password";

    elementos.botaoMostrarSenha.textContent = senhaEstaOculta
      ? "Ocultar"
      : "Mostrar";

    elementos.botaoMostrarSenha.setAttribute(
      "aria-label",
      senhaEstaOculta ? "Ocultar senha" : "Mostrar senha",
    );

    elementos.botaoMostrarSenha.setAttribute(
      "aria-pressed",
      String(senhaEstaOculta),
    );
  });
}

// ============================================
// CONTROLE DO BOTÃO DE LOGIN
// ============================================

function alterarEstadoBotaoLogin(carregando) {
  const elementos = obterElementosLogin();

  if (!elementos.botaoEntrar) {
    return;
  }

  elementos.botaoEntrar.disabled = carregando;

  elementos.botaoEntrar.textContent = carregando ? "Entrando..." : "Entrar";
}

// ============================================
// PROCESSAMENTO DO LOGIN
// ============================================

async function processarLogin(evento) {
  evento.preventDefault();

  const elementos = obterElementosLogin();

  if (!elementos.email || !elementos.senha) {
    return;
  }

  limparMensagensLogin();

  const email = elementos.email.value.trim();
  const senha = elementos.senha.value;

  const erros = validarDadosLogin(email, senha);

  if (erros.length > 0) {
    exibirMensagemLogin("erro", erros.join(" "));
    return;
  }

  alterarEstadoBotaoLogin(true);

  try {
    // Autenticação realizada pela API do backend.
    const resultado = await autenticarUsuario(email, senha);

    if (!resultado.sucesso) {
      exibirMensagemLogin(
        "erro",
        resultado.mensagem || "Não foi possível realizar o login.",
      );

      alterarEstadoBotaoLogin(false);
      return;
    }

    exibirMensagemLogin(
      "sucesso",
      resultado.mensagem || "Login realizado com sucesso!",
    );

    console.log("Usuário autenticado com sucesso.");

    // Redireciona somente após a confirmação da API.
    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro ao processar login:", erro);

    exibirMensagemLogin(
      "erro",
      "Não foi possível conectar ao servidor. Tente novamente.",
    );

    alterarEstadoBotaoLogin(false);
  }
}

// ============================================
// CONFIGURAÇÃO DO FORMULÁRIO
// ============================================

function configurarFormularioLogin() {
  const elementos = obterElementosLogin();

  if (!elementos.formulario) {
    return;
  }

  elementos.formulario.addEventListener("submit", processarLogin);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function iniciarLogin() {
  configurarFormularioLogin();
  configurarVisibilidadeSenha();

  console.log("Página de login inicializada.");
}

document.addEventListener("DOMContentLoaded", iniciarLogin);
