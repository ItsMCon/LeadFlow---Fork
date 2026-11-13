// ============================================
// LEADFLOW - DASHBOARD
// ============================================

// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const campoPesquisa = document.getElementById("pesquisaLeads");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");

const corpoTabelaLeads = document.getElementById("corpoTabelaLeads");

const mensagemCarregamento = document.getElementById("carregandoLeads");
const mensagemErro = document.getElementById("erroCarregamento");
const mensagemSemResultados = document.getElementById("semResultados");

// INDICADORES

const indicadorTotalLeads = document.getElementById("totalLeads");
const indicadorNovosLeads = document.getElementById("novosLeads");
const indicadorAltaPrioridade = document.getElementById("leadsAltaPrioridade");
const indicadorEmAcompanhamento = document.getElementById(
  "leadsEmAcompanhamento",
);

// LISTA DE LEADS CARREGADOS

let leadsDashboard = [];

// ============================================
// NORMALIZAÇÃO DE TEXTO
// ============================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// ============================================
// OBTENÇÃO SEGURA DE DADOS
// ============================================

function obterValorLead(lead, ...campos) {
  for (const campo of campos) {
    if (lead[campo] !== undefined && lead[campo] !== null) {
      return lead[campo];
    }
  }

  return "";
}

// ============================================
// FORMATAÇÃO DOS DADOS
// ============================================

function formatarStatus(status) {
  const statusNormalizado = normalizarTexto(status);

  const statusConhecidos = {
    novo: "Novo",
    contato: "Em contato",
    "em contato": "Em contato",
    qualificacao: "Em qualificação",
    "em qualificacao": "Em qualificação",
    convertido: "Convertido",
    perdido: "Perdido",
  };

  return statusConhecidos[statusNormalizado] || status || "Não informado";
}

function formatarPrioridade(prioridade) {
  const prioridadeNormalizada = normalizarTexto(prioridade);

  const prioridadesConhecidas = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };

  return (
    prioridadesConhecidas[prioridadeNormalizada] || prioridade || "Não definida"
  );
}

function obterClasseStatus(status) {
  const statusNormalizado = normalizarTexto(status);

  const classes = {
    novo: "badge-novo",
    contato: "badge-contato",
    "em contato": "badge-contato",
    qualificacao: "badge-qualificacao",
    "em qualificacao": "badge-qualificacao",
    convertido: "badge-convertido",
    perdido: "badge-perdido",
  };

  return classes[statusNormalizado] || "";
}

function obterClassePrioridade(prioridade) {
  const prioridadeNormalizada = normalizarTexto(prioridade);

  const classes = {
    alta: "badge-alta",
    media: "badge-media",
    baixa: "badge-baixa",
  };

  return classes[prioridadeNormalizada] || "";
}

function formatarOrigem(origem) {
  const origemNormalizada = normalizarTexto(origem);

  if (origemNormalizada === "site") {
    return "Site";
  }

  if (origemNormalizada === "sdr") {
    return "SDR";
  }

  return origem || "Não informada";
}

// ============================================
// ORDENAÇÃO DOS LEADS
// ============================================

function obterDataLead(lead) {
  return obterValorLead(
    lead,
    "createdAt",
    "created_at",
    "dataCriacao",
    "data_criacao",
    "criado_em",
  );
}

function ordenarLeadsRecentes(leads) {
  return [...leads].sort((a, b) => {
    const dataA = new Date(obterDataLead(a)).getTime() || 0;
    const dataB = new Date(obterDataLead(b)).getTime() || 0;

    return dataB - dataA;
  });
}

// ============================================
// ATUALIZAR INDICADORES
// ============================================

function atualizarIndicadoresDashboard(leads) {
  const total = leads.length;

  const novos = leads.filter((lead) => {
    return normalizarTexto(obterValorLead(lead, "status")) === "novo";
  }).length;

  const altaPrioridade = leads.filter((lead) => {
    return (
      normalizarTexto(obterValorLead(lead, "prioridade", "prioridade_ia")) ===
      "alta"
    );
  }).length;

  const emAcompanhamento = leads.filter((lead) => {
    const status = normalizarTexto(obterValorLead(lead, "status"));

    return (
      status === "contato" ||
      status === "em contato" ||
      status === "qualificacao" ||
      status === "em qualificacao"
    );
  }).length;

  indicadorTotalLeads.textContent = total;
  indicadorNovosLeads.textContent = novos;
  indicadorAltaPrioridade.textContent = altaPrioridade;
  indicadorEmAcompanhamento.textContent = emAcompanhamento;
}

function zerarIndicadoresDashboard() {
  indicadorTotalLeads.textContent = "0";
  indicadorNovosLeads.textContent = "0";
  indicadorAltaPrioridade.textContent = "0";
  indicadorEmAcompanhamento.textContent = "0";
}

// ============================================
// CRIAR CÉLULA DA TABELA
// ============================================

function criarCelula(texto) {
  const celula = document.createElement("td");

  celula.textContent = texto || "Não informado";

  return celula;
}

// ============================================
// CRIAR LINHA DE UM LEAD
// ============================================

function criarLinhaLeadDashboard(lead) {
  const linha = document.createElement("tr");

  const id = obterValorLead(lead, "id");

  const empresa = obterValorLead(lead, "empresa");

  const contato = obterValorLead(lead, "nome", "nome_completo", "contato");

  const segmento = obterValorLead(lead, "segmento", "segmento_empresa");

  const prioridade = formatarPrioridade(
    obterValorLead(lead, "prioridade", "prioridade_ia"),
  );

  const status = formatarStatus(obterValorLead(lead, "status"));

  const responsavel = obterValorLead(lead, "responsavel", "responsavel_sdr");

  const origem = formatarOrigem(obterValorLead(lead, "origem"));

  // ATRIBUTOS PARA OS FILTROS

  linha.dataset.status = normalizarTexto(status);
  linha.dataset.prioridade = normalizarTexto(prioridade);

  // EMPRESA, CONTATO E SEGMENTO

  linha.appendChild(criarCelula(empresa));
  linha.appendChild(criarCelula(contato));
  linha.appendChild(criarCelula(segmento));

  // PRIORIDADE

  const celulaPrioridade = document.createElement("td");
  const badgePrioridade = document.createElement("span");

  badgePrioridade.className =
    `badge ${obterClassePrioridade(prioridade)}`.trim();

  badgePrioridade.textContent = prioridade;

  celulaPrioridade.appendChild(badgePrioridade);
  linha.appendChild(celulaPrioridade);

  // STATUS

  const celulaStatus = document.createElement("td");
  const badgeStatus = document.createElement("span");

  badgeStatus.className = `badge ${obterClasseStatus(status)}`.trim();

  badgeStatus.textContent = status;

  celulaStatus.appendChild(badgeStatus);
  linha.appendChild(celulaStatus);

  // RESPONSÁVEL E ORIGEM

  linha.appendChild(criarCelula(responsavel));
  linha.appendChild(criarCelula(origem));

  // BOTÃO DE VISUALIZAÇÃO

  const celulaAcoes = document.createElement("td");
  const containerAcoes = document.createElement("div");
  const botaoDetalhes = document.createElement("a");

  containerAcoes.className = "acoes-tabela";
  botaoDetalhes.className = "botao-acao";

  botaoDetalhes.textContent = "Ver";
  botaoDetalhes.title = "Visualizar lead";
  botaoDetalhes.setAttribute("aria-label", "Visualizar lead");

  if (id) {
    botaoDetalhes.href = `lead_details.html?id=${encodeURIComponent(id)}`;
  } else {
    botaoDetalhes.setAttribute("aria-disabled", "true");
  }

  containerAcoes.appendChild(botaoDetalhes);
  celulaAcoes.appendChild(containerAcoes);

  linha.appendChild(celulaAcoes);

  return linha;
}

// ============================================
// RENDERIZAR TABELA
// ============================================

function renderizarTabelaDashboard(leads) {
  corpoTabelaLeads.innerHTML = "";

  const leadsOrdenados = ordenarLeadsRecentes(leads);

  leadsOrdenados.forEach((lead) => {
    const linha = criarLinhaLeadDashboard(lead);

    corpoTabelaLeads.appendChild(linha);
  });

  mensagemSemResultados.hidden = leadsOrdenados.length > 0;
}

// ============================================
// FILTRAR LEADS
// ============================================

function filtrarLeadsDashboard() {
  const pesquisa = normalizarTexto(campoPesquisa.value);

  const statusSelecionado = normalizarTexto(filtroStatus.value);

  const prioridadeSelecionada = normalizarTexto(filtroPrioridade.value);

  const leadsFiltrados = leadsDashboard.filter((lead) => {
    const empresa = normalizarTexto(obterValorLead(lead, "empresa"));

    const contato = normalizarTexto(
      obterValorLead(lead, "nome", "nome_completo", "contato"),
    );

    const status = normalizarTexto(
      formatarStatus(obterValorLead(lead, "status")),
    );

    const prioridade = normalizarTexto(
      formatarPrioridade(obterValorLead(lead, "prioridade", "prioridade_ia")),
    );

    const correspondePesquisa =
      empresa.includes(pesquisa) || contato.includes(pesquisa);

    const correspondeStatus =
      !statusSelecionado ||
      status === statusSelecionado ||
      (statusSelecionado === "contato" && status === "em contato") ||
      (statusSelecionado === "qualificacao" && status === "em qualificacao");

    const correspondePrioridade =
      !prioridadeSelecionada || prioridade === prioridadeSelecionada;

    return correspondePesquisa && correspondeStatus && correspondePrioridade;
  });

  renderizarTabelaDashboard(leadsFiltrados);
}

// ============================================
// CONFIGURAR EVENTOS DOS FILTROS
// ============================================

function configurarFiltrosDashboard() {
  campoPesquisa.addEventListener("input", filtrarLeadsDashboard);

  filtroStatus.addEventListener("change", filtrarLeadsDashboard);

  filtroPrioridade.addEventListener("change", filtrarLeadsDashboard);
}

// ============================================
// CARREGAR LEADS
// ============================================

async function carregarDashboard() {
  mensagemCarregamento.hidden = false;
  mensagemErro.hidden = true;
  mensagemSemResultados.hidden = true;

  corpoTabelaLeads.innerHTML = "";

  try {
    const resposta = await buscarTodosOsLeads();

    if (!Array.isArray(resposta)) {
      throw new Error("A resposta do serviço de leads é inválida.");
    }

    leadsDashboard = resposta;

    atualizarIndicadoresDashboard(leadsDashboard);

    filtrarLeadsDashboard();
  } catch (erro) {
    console.error("Erro ao carregar o dashboard:", erro);

    leadsDashboard = [];

    zerarIndicadoresDashboard();

    mensagemErro.hidden = false;
  } finally {
    mensagemCarregamento.hidden = true;
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function iniciarDashboard() {
  configurarFiltrosDashboard();

  carregarDashboard();
}

document.addEventListener("DOMContentLoaded", iniciarDashboard);