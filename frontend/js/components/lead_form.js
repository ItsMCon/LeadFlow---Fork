// ============================================
// LEADFLOW - FORMULÁRIO DE LEADS
// ============================================

// ============================================
// CAPTURA DOS DADOS
// ============================================

function obterDadosFormulario(formulario) {
  const obterValor = (seletor) => {
    const campo = formulario.querySelector(seletor);

    return campo ? campo.value.trim() : "";
  };

  return {
    nome: obterValor("#nomeLead"),
    empresa: obterValor("#empresaLead"),
    email: obterValor("#emailLead"),
    telefone: obterValor("#telefoneLead"),
    segmento: obterValor("#segmentoLead"),
    origem: obterValor("#origemLead"),
    responsavel: obterValor("#responsavelLead"),
    observacoes: obterValor("#observacoesLead"),
    descricao: obterValor("#descricaoLead"),
  };
}

// ============================================
// VALIDAÇÃO DOS CAMPOS
// ============================================

function validarFormularioLead(dados) {
  const erros = [];

  if (!dados.nome) {
    erros.push("O nome do contato é obrigatório.");
  }

  if (!dados.empresa) {
    erros.push("O nome da empresa é obrigatório.");
  }

  if (!dados.email) {
    erros.push("O e-mail é obrigatório.");
  } else {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(dados.email)) {
      erros.push("Informe um endereço de e-mail válido.");
    }
  }

  if (!dados.telefone) {
    erros.push("O telefone é obrigatório.");
  } else {
    const telefoneNumeros = dados.telefone.replace(/\D/g, "");

    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 13) {
      erros.push("Informe um telefone válido.");
    }
  }

  if (!dados.segmento) {
    erros.push("Selecione o segmento da empresa.");
  }

  if (!dados.origem) {
    erros.push("Selecione a origem do lead.");
  }

  if (!dados.descricao) {
    erros.push("A descrição da necessidade é obrigatória.");
  }

  return erros;
}

// ============================================
// EXIBIÇÃO DAS MENSAGENS
// ============================================

function exibirErrosFormulario(erros) {
  const elementoErros = document.getElementById("errosFormulario");

  if (!elementoErros) {
    console.error(erros.join("\n"));
    return;
  }

  elementoErros.innerHTML = "";

  if (erros.length === 0) {
    elementoErros.hidden = true;
    return;
  }

  erros.forEach((erro) => {
    const item = document.createElement("p");

    item.textContent = erro;

    elementoErros.appendChild(item);
  });

  elementoErros.hidden = false;
}

function exibirMensagemSucesso(mensagem) {
  const elementoMensagem = document.getElementById("mensagemFormulario");

  if (!elementoMensagem) {
    console.log(mensagem);
    return;
  }

  elementoMensagem.textContent = mensagem;
  elementoMensagem.hidden = false;
}

function limparMensagemSucesso() {
  const elementoMensagem = document.getElementById("mensagemFormulario");

  if (elementoMensagem) {
    elementoMensagem.textContent = "";
    elementoMensagem.hidden = true;
  }
}

// ============================================
// CARREGAR DADOS NO FORMULÁRIO
// ============================================

function preencherFormularioLead(formulario, lead) {
  const campos = {
    "#nomeLead": lead.nome ?? lead.nome_completo,
    "#empresaLead": lead.empresa,
    "#emailLead": lead.email,
    "#telefoneLead": lead.telefone ?? lead.whatsapp,
    "#segmentoLead": lead.segmento,
    "#origemLead": lead.origem,
    "#responsavelLead": lead.responsavel,
    "#observacoesLead": lead.observacoes,
    "#descricaoLead": lead.descricao,
  };

  Object.entries(campos).forEach(([seletor, valor]) => {
    const campo = formulario.querySelector(seletor);

    if (campo && valor !== undefined && valor !== null) {
      campo.value = valor;
    }
  });
}

// ============================================
// IDENTIFICAR MODO DE EDIÇÃO
// ============================================

function obterIdLeadDaURL() {
  const parametros = new URLSearchParams(window.location.search);

  return parametros.get("id");
}

// ============================================
// CONFIGURAR MODO DE EDIÇÃO
// ============================================

async function configurarEdicaoLead(formulario, idLead) {
  const titulo = document.getElementById("tituloFormulario");
  const botaoSalvar = document.getElementById("botaoSalvarLead");

  try {
    const lead = await buscarLeadPorId(idLead);

    if (!lead || typeof lead !== "object") {
      throw new Error("Lead não encontrado.");
    }

    preencherFormularioLead(formulario, lead);

    formulario.dataset.id = idLead;

    if (titulo) {
      titulo.textContent = "Editar lead";
    }

    if (botaoSalvar) {
      botaoSalvar.textContent = "Salvar alterações";
    }
  } catch (erro) {
    console.error("Erro ao carregar lead para edição:", erro);

    exibirErrosFormulario([
      erro.message || "Não foi possível carregar os dados do lead.",
    ]);

    formulario.dataset.erroCarregamento = "true";

    if (botaoSalvar) {
      botaoSalvar.disabled = true;
    }
  }
}

// ============================================
// CONFIGURAR ENVIO DO FORMULÁRIO
// ============================================

function configurarEnvioFormulario(formulario) {
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (formulario.dataset.erroCarregamento === "true") {
      return;
    }

    if (formulario.dataset.enviando === "true") {
      return;
    }

    const botaoSalvar = document.getElementById("botaoSalvarLead");

    const textoOriginal = botaoSalvar ? botaoSalvar.textContent : "Salvar lead";

    const dados = obterDadosFormulario(formulario);

    const erros = validarFormularioLead(dados);

    exibirErrosFormulario(erros);
    limparMensagemSucesso();

    if (erros.length > 0) {
      return;
    }

    try {
      formulario.dataset.enviando = "true";

      if (botaoSalvar) {
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";
      }

      const idLead = formulario.dataset.id;

      if (idLead) {
        await editarLead(idLead, dados);

        exibirMensagemSucesso("Lead atualizado com sucesso!");
      } else {
        await cadastrarLead(dados);

        exibirMensagemSucesso("Lead cadastrado com sucesso!");
      }

      // Mantém o formulário bloqueado após o sucesso.
      // Isso impede novos envios durante o redirecionamento.

      setTimeout(() => {
        window.location.href = "leads.html";
      }, 1200);
    } catch (erro) {
      console.error("Erro ao salvar formulário:", erro);

      exibirErrosFormulario([
        erro.message || "Não foi possível salvar o lead. Tente novamente.",
      ]);

      delete formulario.dataset.enviando;

      if (botaoSalvar) {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = textoOriginal;
      }
    }
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

async function iniciarFormularioLead() {
  const formulario = document.getElementById("formularioLead");

  if (!formulario) {
    return;
  }

  const idLead = obterIdLeadDaURL();

  if (idLead) {
    await configurarEdicaoLead(formulario, idLead);
  }

  configurarEnvioFormulario(formulario);
}

// ============================================
// INICIAR QUANDO A PÁGINA CARREGAR
// ============================================

document.addEventListener("DOMContentLoaded", iniciarFormularioLead);
