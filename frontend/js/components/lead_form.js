// ============================================
// LEADFLOW - FORMULÁRIO DE CADASTRO E EDIÇÃO
// ============================================

// ============================================
// OBTER DADOS DO FORMULÁRIO
// ============================================

function obterDadosFormulario() {
  return {
    nome: document.getElementById("nomeLead").value.trim(),
    empresa: document.getElementById("empresaLead").value.trim(),
    email: document.getElementById("emailLead").value.trim(),
    telefone: document.getElementById("telefoneLead").value.trim(),
    segmento: document.getElementById("segmentoLead").value,
    origem: document.getElementById("origemLead").value,
    responsavel: document.getElementById("responsavelLead").value,
    descricao: document.getElementById("descricaoLead").value.trim(),
    observacoes: document.getElementById("observacoesLead").value.trim(),
  };
}

// ============================================
// VALIDAR FORMULÁRIO
// ============================================

function validarFormularioLead(dados) {
  const erros = [];

  if (!dados.nome) {
    erros.push("Informe o nome do contato.");
  }

  if (!dados.empresa) {
    erros.push("Informe o nome da empresa.");
  }

  if (!dados.email) {
    erros.push("Informe o e-mail.");
  } else {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(dados.email)) {
      erros.push("Informe um endereço de e-mail válido.");
    }
  }

  if (!dados.telefone) {
    erros.push("Informe o telefone.");
  } else {
    const telefoneNumerico = dados.telefone.replace(/\D/g, "");

    if (telefoneNumerico.length < 10 || telefoneNumerico.length > 13) {
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
    erros.push("Informe a necessidade do cliente.");
  }

  return erros;
}

// ============================================
// EXIBIR ERROS
// ============================================

function exibirErrosFormulario(erros) {
  const elementoErros = document.getElementById("errosFormulario");

  if (!elementoErros) {
    return;
  }

  elementoErros.innerHTML = "";

  if (erros.length === 0) {
    elementoErros.hidden = true;
    return;
  }

  const lista = document.createElement("ul");

  erros.forEach((erro) => {
    const item = document.createElement("li");
    item.textContent = erro;
    lista.appendChild(item);
  });

  elementoErros.appendChild(lista);
  elementoErros.hidden = false;
}

// ============================================
// EXIBIR MENSAGEM DE SUCESSO
// ============================================

function exibirMensagemSucesso(mensagem) {
  const elementoMensagem = document.getElementById("mensagemFormulario");

  if (!elementoMensagem) {
    return;
  }

  elementoMensagem.textContent = mensagem;
  elementoMensagem.hidden = false;
}

// ============================================
// LIMPAR MENSAGEM DE SUCESSO
// ============================================

function limparMensagemSucesso() {
  const elementoMensagem = document.getElementById("mensagemFormulario");

  if (!elementoMensagem) {
    return;
  }

  elementoMensagem.textContent = "";
  elementoMensagem.hidden = true;
}

// ============================================
// PREENCHER FORMULÁRIO NA EDIÇÃO
// ============================================

function preencherFormularioLead(formulario, lead) {
  formulario.querySelector("#nomeLead").value = lead.nome || "";
  formulario.querySelector("#empresaLead").value = lead.empresa || "";
  formulario.querySelector("#emailLead").value = lead.email || "";
  formulario.querySelector("#telefoneLead").value = lead.telefone || "";
  formulario.querySelector("#segmentoLead").value = lead.segmento || "";
  formulario.querySelector("#origemLead").value = lead.origem || "";
  formulario.querySelector("#responsavelLead").value = lead.responsavel || "";
  formulario.querySelector("#descricaoLead").value = lead.descricao || "";
  formulario.querySelector("#observacoesLead").value = lead.observacoes || "";
}

// ============================================
// OBTER ID DO LEAD PELA URL
// ============================================

function obterIdLeadDaURL() {
  const parametros = new URLSearchParams(window.location.search);

  return parametros.get("id");
}

// ============================================
// CONFIGURAR MODO DE EDIÇÃO
// ============================================

function configurarEdicaoLead(formulario, idLead) {
  const titulo = document.getElementById("tituloFormulario");
  const botaoSalvar = document.getElementById("botaoSalvarLead");

  const lead = buscarLeadPorId(idLead);

  if (!lead) {
    exibirErrosFormulario(["Não foi possível encontrar o lead solicitado."]);

    formulario.hidden = true;
    return false;
  }

  preencherFormularioLead(formulario, lead);

  formulario.dataset.id = lead.id;

  if (titulo) {
    titulo.textContent = "Editar lead";
  }

  if (botaoSalvar) {
    botaoSalvar.textContent = "Salvar alterações";
  }

  document.title = "LeadFlow | Editar Lead";

  const introducao = document.querySelector(".formulario-introducao p");

  if (introducao) {
    introducao.textContent =
      "Atualize as informações do lead cadastrado no sistema.";
  }

  return true;
}

// ============================================
// CONFIGURAR ENVIO DO FORMULÁRIO
// ============================================

function configurarEnvioFormulario(formulario) {
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    exibirErrosFormulario([]);
    limparMensagemSucesso();

    const dados = obterDadosFormulario();
    const erros = validarFormularioLead(dados);

    if (erros.length > 0) {
      exibirErrosFormulario(erros);
      return;
    }

    const botaoSalvar = document.getElementById("botaoSalvarLead");

    const idLead = formulario.dataset.id;

    if (botaoSalvar) {
      botaoSalvar.disabled = true;
      botaoSalvar.textContent = "Salvando...";
    }

    try {
      let resultado;

      if (idLead) {
        resultado = await editarLead(idLead, dados);

        if (resultado === false || resultado === null) {
          throw new Error("Não foi possível atualizar o lead.");
        }

        exibirMensagemSucesso("Lead atualizado com sucesso!");
      } else {
        resultado = await cadastrarLead(dados);

        if (resultado === false || resultado === null) {
          throw new Error("Não foi possível cadastrar o lead.");
        }

        exibirMensagemSucesso("Lead cadastrado com sucesso!");
      }

      // Retornar ao Dashboard após salvar.
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } catch (erro) {
      console.error("Erro ao salvar lead:", erro);

      exibirErrosFormulario([
        erro.message || "Ocorreu um erro ao salvar o lead.",
      ]);

      if (botaoSalvar) {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = idLead ? "Salvar alterações" : "Salvar lead";
      }
    }
  });
}

// ============================================
// INICIALIZAR FORMULÁRIO
// ============================================

function iniciarFormularioLead() {
  const formulario = document.getElementById("formularioLead");

  if (!formulario) {
    return;
  }

  const idLead = obterIdLeadDaURL();

  if (idLead) {
    const edicaoIniciada = configurarEdicaoLead(formulario, idLead);

    if (!edicaoIniciada) {
      return;
    }
  }

  configurarEnvioFormulario(formulario);
}

document.addEventListener("DOMContentLoaded", iniciarFormularioLead);
