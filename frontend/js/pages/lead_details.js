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
// HISTÓRICO DE CONTATOS
// ============================================

function renderizarHistoricoContatos(lead) {
  const container = document.getElementById("historicoContatos");
  const contador = document.getElementById("totalTentativasContato");

  if (!container) {
    return;
  }

  const historico = Array.isArray(lead.historicoContatos)
    ? lead.historicoContatos
    : [];

  // Atualiza o contador de tentativas.
  if (contador) {
    contador.textContent =
      historico.length === 1 ? "1 tentativa" : `${historico.length} tentativas`;
  }

  // Limpa o conteúdo anterior.
  container.innerHTML = "";

  // Exibe uma mensagem caso não existam tentativas.
  if (historico.length === 0) {
    const mensagem = document.createElement("p");

    mensagem.id = "semHistoricoContatos";
    mensagem.textContent = "Nenhuma tentativa de contato registrada.";

    container.appendChild(mensagem);

    return;
  }

  // Mostra as tentativas mais recentes primeiro.
  const historicoOrdenado = [...historico].sort((a, b) => {
    return new Date(b.data) - new Date(a.data);
  });

  historicoOrdenado.forEach((tentativa) => {
    const item = document.createElement("article");
    item.className = "item-historico-contato";

    const cabecalho = document.createElement("div");
    cabecalho.className = "cabecalho-tentativa";

    const numero = document.createElement("strong");
    numero.className = "numero-tentativa";
    numero.textContent = `${tentativa.numero}ª tentativa`;

    const data = document.createElement("span");
    data.className = "data-tentativa";
    data.textContent = formatarDataLead(tentativa.data);

    cabecalho.append(numero, data);

    const detalhes = document.createElement("div");
    detalhes.className = "detalhes-tentativa";

    const canal = document.createElement("p");
    canal.textContent = `Canal: ${tentativa.canal || "-"}`;

    const resultado = document.createElement("p");
    resultado.textContent = `Resultado: ${tentativa.resultado || "-"}`;

    const responsavel = document.createElement("p");
    responsavel.textContent = `Responsável: ${tentativa.responsavel || "-"}`;

    detalhes.append(canal, resultado, responsavel);

    item.append(cabecalho, detalhes);

    // A observação só aparece quando foi preenchida.
    if (tentativa.observacao) {
      const observacao = document.createElement("p");

      observacao.className = "observacao-tentativa";
      observacao.textContent = `Observação: ${tentativa.observacao}`;

      item.appendChild(observacao);
    }

    container.appendChild(item);
  });
}

// ============================================
// REGISTRAR NOVA TENTATIVA DE CONTATO
// ============================================

function configurarRegistroContato(lead) {
  const formulario = document.getElementById("formularioTentativaContato");

  const seletorCanal = document.getElementById("canalContato");
  const seletorResultado = document.getElementById("resultadoContato");
  const campoObservacao = document.getElementById("observacaoContato");
  const mensagem = document.getElementById("mensagemContato");

  if (!formulario || !seletorCanal || !seletorResultado || !campoObservacao) {
    return;
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dadosContato = {
      canal: seletorCanal.value,
      resultado: seletorResultado.value,
      observacao: campoObservacao.value,
      responsavel: lead.responsavel,
    };

    if (!dadosContato.canal || !dadosContato.resultado) {
      if (mensagem) {
        mensagem.textContent = "Selecione o canal e o resultado do contato.";
      }

      return;
    }

    const botaoEnviar = formulario.querySelector('button[type="submit"]');

    if (mensagem) {
      mensagem.textContent = "";
    }

    if (botaoEnviar) {
      botaoEnviar.disabled = true;
      botaoEnviar.textContent = "Registrando...";
    }

    try {
      // Registra a tentativa no serviço de leads.
      const tentativa = await registrarTentativaContato(lead.id, dadosContato);

      // Atualiza o histórico que está em memória.
      if (!Array.isArray(lead.historicoContatos)) {
        lead.historicoContatos = [];
      }

      lead.historicoContatos.push(tentativa);

      // Atualiza a data da última modificação.
      lead.dataAtualizacao = new Date().toISOString();

      preencherCampo(
        "dataAtualizacaoLead",
        formatarDataLead(lead.dataAtualizacao),
      );

      preencherCampo(
        "dataAtualizacaoResumo",
        formatarDataLead(lead.dataAtualizacao),
      );

      // Atualiza o histórico exibido na página.
      renderizarHistoricoContatos(lead);

      // Limpa os campos após o registro.
      formulario.reset();

      if (mensagem) {
        mensagem.textContent = "Tentativa de contato registrada com sucesso.";
      }
    } catch (erro) {
      console.error("Erro ao registrar contato:", erro);

      if (mensagem) {
        mensagem.textContent =
          "Não foi possível registrar a tentativa. Tente novamente.";
      }
    } finally {
      if (botaoEnviar) {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Registrar tentativa";
      }
    }
  });
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
      const leadAtualizado = await atualizarStatusLead(
        lead.id,
        statusFormatado,
      );

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
    const lead = await buscarLeadPorId(idLead);

    if (!lead) {
      exibirErroLead();
      return;
    }

    preencherDetalhesLead(lead);

    // Exibe o histórico já registrado.
    renderizarHistoricoContatos(lead);

    configurarAlteracaoStatus(lead);

    configurarRegistroContato(lead);

    configurarEdicaoLead();
  } catch (erro) {
    console.error("Erro ao carregar detalhes do lead:", erro);

    exibirErroLead();
  }
}

document.addEventListener("DOMContentLoaded", iniciarDetalhesLead);
