// ============================================
// LEADFLOW - DETALHES DO LEAD
// ============================================

// ============================================
// IDENTIFICAÇÃO DO LEAD
// ============================================

function obterIdLead() {
  const parametros = new URLSearchParams(window.location.search);

  return parametros.get("id");
}

// ============================================
// FORMATAÇÃO DE DATAS
// ============================================

function formatarDataLead(data) {
  if (!data || data === "--") {
    return "-";
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dataConvertida);
}

// ============================================
// PREENCHIMENTO DAS INFORMAÇÕES
// ============================================

function preencherCampo(idElemento, valor) {
  const elemento = document.getElementById(idElemento);

  if (elemento) {
    elemento.textContent = valor || "-";
  }
}

function preencherDetalhesLead(lead) {
  preencherCampo("nomeLead", lead.nome);
  preencherCampo("empresaLead", lead.empresa);
  preencherCampo("emailLead", lead.email);
  preencherCampo("telefoneLead", lead.telefone);
  preencherCampo("segmentoLead", lead.segmento);
  preencherCampo("prioridadeLead", lead.prioridade);
  preencherCampo("justificativaLead", lead.justificativa);
  preencherCampo("abordagemLead", lead.abordagem);
  preencherCampo("statusLead", lead.status);
  preencherCampo("responsavelLead", lead.responsavel);
  preencherCampo("origemLead", lead.origem);
  preencherCampo("observacoesLead", lead.observacoes);

  preencherCampo("idLead", lead.id);
  preencherCampo("idLeadResumo", lead.id);

  const dataCadastro = formatarDataLead(lead.dataCadastro);
  const dataAtualizacao = formatarDataLead(lead.dataAtualizacao);

  preencherCampo("dataCadastroLead", dataCadastro);
  preencherCampo("dataCadastroResumo", dataCadastro);

  preencherCampo("dataAtualizacaoLead", dataAtualizacao);
  preencherCampo("dataAtualizacaoResumo", dataAtualizacao);

  // Atualiza a inicial do avatar.
  const avatar = document.getElementById("avatarLead");

  if (avatar) {
    avatar.textContent = lead.nome ? lead.nome.charAt(0).toUpperCase() : "L";
  }

  // Guarda o identificador no botão de edição.
  const botaoEditar = document.getElementById("botaoEditarLead");

  if (botaoEditar) {
    botaoEditar.dataset.id = lead.id;
  }

  // Seleciona o status atual.
  const seletorStatus = document.getElementById("novoStatusLead");

  if (seletorStatus) {
    const statusParaValor = {
      Novo: "novo",
      "Em contato": "contato",
      "Em qualificação": "qualificacao",
      Convertido: "convertido",
      Perdido: "perdido",
    };

    seletorStatus.value = statusParaValor[lead.status] || "novo";
  }
}

// ============================================
// TRATAMENTO DE LEAD NÃO ENCONTRADO
// ============================================

function exibirErroLead() {
  const conteudo = document.getElementById("detalhesLead");

  if (conteudo) {
    conteudo.innerHTML = "";

    const mensagem = document.createElement("p");

    mensagem.textContent = "Lead não encontrado.";

    conteudo.appendChild(mensagem);
  }
}

// ============================================
// ALTERAÇÃO DE STATUS
// ============================================

function configurarAlteracaoStatus(lead) {
  const formulario = document.getElementById("formularioStatus");
  const seletorStatus = document.getElementById("novoStatusLead");
  const mensagem = document.getElementById("mensagemStatus");

  if (!formulario || !seletorStatus) {
    return;
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const novoStatus = seletorStatus.value;

    if (!novoStatus) {
      return;
    }

    const statusParaTexto = {
      novo: "Novo",
      contato: "Em contato",
      qualificacao: "Em qualificação",
      convertido: "Convertido",
      perdido: "Perdido",
    };

    const statusFormatado = statusParaTexto[novoStatus];

    if (!statusFormatado) {
      return;
    }

    const botaoEnviar = formulario.querySelector('button[type="submit"]');

    if (mensagem) {
      mensagem.textContent = "";
    }

    if (botaoEnviar) {
      botaoEnviar.disabled = true;
    }

    try {
      // Atualiza o mesmo armazenamento utilizado
      // pela listagem e pelo formulário.
      const leadAtualizado = await atualizarStatusLead(
        lead.id,
        statusFormatado,
      );

      // Atualiza os dados exibidos na página.
      Object.assign(lead, leadAtualizado);

      preencherCampo("statusLead", lead.status);

      const dataAtualizacao = formatarDataLead(lead.dataAtualizacao);

      preencherCampo("dataAtualizacaoLead", dataAtualizacao);
      preencherCampo("dataAtualizacaoResumo", dataAtualizacao);

      if (mensagem) {
        mensagem.textContent = "Status atualizado com sucesso.";
      }
    } catch (erro) {
      console.error("Erro ao atualizar status:", erro);

      if (mensagem) {
        mensagem.textContent =
          "Não foi possível atualizar o status. Tente novamente.";
      }
    } finally {
      if (botaoEnviar) {
        botaoEnviar.disabled = false;
      }
    }
  });
}

// ============================================
// EDIÇÃO DO LEAD
// ============================================

function configurarEdicaoLead() {
  const botaoEditar = document.getElementById("botaoEditarLead");

  if (!botaoEditar) {
    return;
  }

  botaoEditar.addEventListener("click", () => {
    const idLead = botaoEditar.dataset.id;

    if (!idLead) {
      console.error("Identificador do lead não encontrado.");
      return;
    }

    // Abre o formulário no modo de edição.
    window.location.href = `leads_form.html?id=${encodeURIComponent(idLead)}`;
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

async function iniciarDetalhesLead() {
  const idLead = obterIdLead();

  if (!idLead) {
    exibirErroLead();
    return;
  }

  try {
    // Consulta o serviço compartilhado.
    const lead = await buscarLeadPorId(idLead);

    if (!lead) {
      exibirErroLead();
      return;
    }

    preencherDetalhesLead(lead);

    configurarAlteracaoStatus(lead);

    configurarEdicaoLead();
  } catch (erro) {
    console.error("Erro ao carregar detalhes do lead:", erro);

    exibirErroLead();
  }
}

document.addEventListener("DOMContentLoaded", iniciarDetalhesLead);
