// ============================================
// LEADFLOW - TABELA DE LEADS
// ============================================

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function obterTextoSeguro(valor, valorPadrao = "-") {
  if (valor === null || valor === undefined || valor === "") {
    return valorPadrao;
  }

  return String(valor);
}

function normalizarClasseCSS(valor) {
  return String(valor || "")
    .toLowerCase()
    .trim()
    .replaceAll(" ", "-");
}

// ============================================
// CRIAR LINHA DA TABELA
// ============================================

function criarLinhaLead(lead) {
  const linha = document.createElement("tr");

  const nome = obterTextoSeguro(lead.nome);
  const empresa = obterTextoSeguro(lead.empresa);
  const email = obterTextoSeguro(lead.email);
  const status = obterTextoSeguro(lead.status);
  const prioridade = obterTextoSeguro(lead.prioridade);
  const responsavel = obterTextoSeguro(lead.responsavel, "Não atribuído");

  // Cria as células da tabela.
  const valores = [nome, empresa, email, null, null, responsavel, null];

  valores.forEach((valor) => {
    const celula = document.createElement("td");

    if (valor !== null) {
      celula.textContent = valor;
    }

    linha.appendChild(celula);
  });

  // Cria o indicador de status.
  const celulaStatus = linha.children[3];
  const indicadorStatus = document.createElement("span");

  indicadorStatus.className = `status status-${normalizarClasseCSS(status)}`;

  indicadorStatus.textContent = status;

  celulaStatus.appendChild(indicadorStatus);

  // Cria o indicador de prioridade.
  const celulaPrioridade = linha.children[4];
  const indicadorPrioridade = document.createElement("span");

  indicadorPrioridade.className = `prioridade prioridade-${normalizarClasseCSS(prioridade)}`;

  indicadorPrioridade.textContent = prioridade;

  celulaPrioridade.appendChild(indicadorPrioridade);

  // Cria o botão de detalhes.
  const celulaAcoes = linha.children[6];
  const botaoDetalhes = document.createElement("button");

  botaoDetalhes.type = "button";
  botaoDetalhes.className = "botao-acao";
  botaoDetalhes.textContent = "Detalhes";

  botaoDetalhes.addEventListener("click", () => {
    if (!lead.id) {
      console.error("Identificador do lead não encontrado.");
      return;
    }

    window.location.href = `lead_details.html?id=${encodeURIComponent(lead.id)}`;
  });

  celulaAcoes.appendChild(botaoDetalhes);

  return linha;
}

// ============================================
// RENDERIZAR TABELA
// ============================================

function renderizarTabelaLeads(leads) {
  const corpoTabela = document.getElementById("corpoTabelaLeads");
  const mensagemSemResultados = document.getElementById("semResultados");

  if (!corpoTabela) {
    return;
  }

  // Limpa as linhas anteriores.
  corpoTabela.replaceChildren();

  // Cria uma linha para cada lead.
  leads.forEach((lead) => {
    const linha = criarLinhaLead(lead);

    corpoTabela.appendChild(linha);
  });

  // Exibe a mensagem quando não existem resultados.
  if (mensagemSemResultados) {
    mensagemSemResultados.hidden = leads.length !== 0;
  }
}

// ============================================
// FILTRAR LEADS
// ============================================

function filtrarLeads(leads) {
  const campoPesquisa = document.getElementById("pesquisaLeads");
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroPrioridade = document.getElementById("filtroPrioridade");

  const pesquisa = campoPesquisa
    ? campoPesquisa.value.toLowerCase().trim()
    : "";

  const statusSelecionado = filtroStatus ? filtroStatus.value : "";

  const prioridadeSelecionada = filtroPrioridade ? filtroPrioridade.value : "";

  return leads.filter((lead) => {
    const nome = obterTextoSeguro(lead.nome, "").toLowerCase();
    const empresa = obterTextoSeguro(lead.empresa, "").toLowerCase();
    const email = obterTextoSeguro(lead.email, "").toLowerCase();

    const status = obterTextoSeguro(lead.status, "");
    const prioridade = obterTextoSeguro(lead.prioridade, "");

    const correspondePesquisa =
      nome.includes(pesquisa) ||
      empresa.includes(pesquisa) ||
      email.includes(pesquisa);

    const correspondeStatus =
      !statusSelecionado || status === statusSelecionado;

    const correspondePrioridade =
      !prioridadeSelecionada || prioridade === prioridadeSelecionada;

    return correspondePesquisa && correspondeStatus && correspondePrioridade;
  });
}

// ============================================
// ATUALIZAR INDICADORES
// ============================================

function atualizarIndicadoresLeads(leads) {
  const totalLeads = document.getElementById("totalLeads");
  const leadsNovos = document.getElementById("leadsNovos");
  const leadsEmContato = document.getElementById("leadsEmContato");
  const leadsConvertidos = document.getElementById("leadsConvertidos");

  if (totalLeads) {
    totalLeads.textContent = leads.length;
  }

  if (leadsNovos) {
    leadsNovos.textContent = leads.filter(
      (lead) => lead.status === "Novo",
    ).length;
  }

  if (leadsEmContato) {
    leadsEmContato.textContent = leads.filter(
      (lead) => lead.status === "Em contato",
    ).length;
  }

  if (leadsConvertidos) {
    leadsConvertidos.textContent = leads.filter(
      (lead) => lead.status === "Convertido",
    ).length;
  }
}

// ============================================
// CONFIGURAR FILTROS
// ============================================

function configurarFiltrosLeads(leads) {
  const campoPesquisa = document.getElementById("pesquisaLeads");
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroPrioridade = document.getElementById("filtroPrioridade");

  function atualizarTabela() {
    const leadsFiltrados = filtrarLeads(leads);

    renderizarTabelaLeads(leadsFiltrados);
  }

  if (campoPesquisa) {
    campoPesquisa.addEventListener("input", atualizarTabela);
  }

  if (filtroStatus) {
    filtroStatus.addEventListener("change", atualizarTabela);
  }

  if (filtroPrioridade) {
    filtroPrioridade.addEventListener("change", atualizarTabela);
  }
}

// ============================================
// INICIALIZAR TABELA
// ============================================

async function iniciarTabelaLeads() {
  const corpoTabela = document.getElementById("corpoTabelaLeads");

  if (!corpoTabela) {
    return;
  }

  const mensagemCarregando = document.getElementById("carregandoLeads");
  const mensagemErro = document.getElementById("erroCarregamento");

  try {
    if (mensagemCarregando) {
      mensagemCarregando.hidden = false;
    }

    if (mensagemErro) {
      mensagemErro.hidden = true;
    }

    // Recupera os leads do serviço compartilhado.
    const leads = await buscarTodosOsLeads();

    if (!Array.isArray(leads)) {
      throw new Error("O serviço não retornou uma lista válida de leads.");
    }

    if (mensagemCarregando) {
      mensagemCarregando.hidden = true;
    }

    // Os indicadores consideram todos os leads,
    // independentemente dos filtros selecionados.
    atualizarIndicadoresLeads(leads);

    // Configura a pesquisa e os filtros.
    configurarFiltrosLeads(leads);

    // Exibe todos os leads inicialmente.
    renderizarTabelaLeads(leads);
  } catch (erro) {
    console.error("Erro ao carregar leads:", erro);

    if (mensagemCarregando) {
      mensagemCarregando.hidden = true;
    }

    if (mensagemErro) {
      mensagemErro.hidden = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", iniciarTabelaLeads);
