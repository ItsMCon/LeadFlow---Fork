// ============================================
// LEADFLOW - DASHBOARD
// ============================================

// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const campoPesquisa = document.getElementById("pesquisaLeads");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");
const filtroResponsavel = document.getElementById("filtroResponsavel");

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

// Enquanto a IA não estiver implementada,
// a ordem é apenas demonstrativa.
//
// A sequência original dos leads será utilizada
// como referência para o ranking.

function ordenarLeadsPorPrioridade(leads) {
  return leads
    .map((lead, indiceOriginal) => ({
      lead,
      indiceOriginal,
    }))
    .sort((a, b) => {
      return a.indiceOriginal - b.indiceOriginal;
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

  // Exibe quantos leads existem no ranking,
  // em vez de contar leads de alta prioridade.
  indicadorAltaPrioridade.textContent = total;

  indicadorEmAcompanhamento.textContent = emAcompanhamento;
}

function zerarIndicadoresDashboard() {
  indicadorTotalLeads.textContent = "0";
  indicadorNovosLeads.textContent = "0";
  indicadorAltaPrioridade.textContent = "0";
  indicadorEmAcompanhamento.textContent = "0";
}

// ============================================
// PREENCHER FILTRO DE RESPONSÁVEIS
// ============================================

function preencherFiltroResponsaveis(leads) {
  if (!filtroResponsavel) return;

  const responsaveis = [
    ...new Set(
      leads
        .map((lead) =>
          String(obterValorLead(lead, "responsavel", "responsavel_sdr")).trim(),
        )
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const valorAnterior = filtroResponsavel.value;

  filtroResponsavel.innerHTML = "";

  const opcaoPadrao = document.createElement("option");
  opcaoPadrao.value = "";
  opcaoPadrao.textContent = "Todos os responsáveis";

  filtroResponsavel.appendChild(opcaoPadrao);

  responsaveis.forEach((responsavel) => {
    const opcao = document.createElement("option");

    opcao.value = responsavel;
    opcao.textContent = responsavel;

    filtroResponsavel.appendChild(opcao);
  });

  if (responsaveis.includes(valorAnterior)) {
    filtroResponsavel.value = valorAnterior;
  }
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

function criarLinhaLeadDashboard(lead, posicao) {
  const linha = document.createElement("tr");

  const id = obterValorLead(lead, "id");

  const empresa = obterValorLead(lead, "empresa");

  const contato = obterValorLead(lead, "nome", "nome_completo", "contato");

  const segmento = obterValorLead(lead, "segmento", "segmento_empresa");

  const status = formatarStatus(obterValorLead(lead, "status"));

  const responsavel = obterValorLead(lead, "responsavel", "responsavel_sdr");

  const origem = formatarOrigem(obterValorLead(lead, "origem"));

  // ATRIBUTOS PARA OS FILTROS

  linha.dataset.status = normalizarTexto(status);
  linha.dataset.responsavel = normalizarTexto(responsavel);
  linha.dataset.posicao = posicao;

  // EMPRESA, CONTATO E SEGMENTO

  linha.appendChild(criarCelula(empresa));
  linha.appendChild(criarCelula(contato));
  linha.appendChild(criarCelula(segmento));

  // POSIÇÃO NO RANKING

  const celulaPrioridade = document.createElement("td");
  const badgePosicao = document.createElement("span");

  badgePosicao.className = "badge badge-ranking";
  badgePosicao.textContent = `${posicao}º`;

  badgePosicao.title =
    posicao === 1
      ? "Lead mais prioritário"
      : `${posicao}º lead mais prioritário`;

  celulaPrioridade.appendChild(badgePosicao);
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

  // BOTÃO DE DETALHES

  const celulaAcoes = document.createElement("td");
  const containerAcoes = document.createElement("div");
  const botaoDetalhes = document.createElement("a");

  containerAcoes.className = "acoes-tabela";
  botaoDetalhes.className = "botao-acao";

  botaoDetalhes.textContent = "Detalhes";
  botaoDetalhes.title = "Visualizar detalhes do lead";
  botaoDetalhes.setAttribute("aria-label", "Visualizar detalhes do lead");

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

  const leadsOrdenados = ordenarLeadsPorPrioridade(leads);

  leadsOrdenados.forEach((item, indice) => {
    const posicao = indice + 1;

    const linha = criarLinhaLeadDashboard(item.lead, posicao);

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

  const responsavelSelecionado = normalizarTexto(
    filtroResponsavel?.value || "",
  );

  const leadsFiltrados = leadsDashboard.filter((lead) => {
    const empresa = normalizarTexto(obterValorLead(lead, "empresa"));

    const contato = normalizarTexto(
      obterValorLead(lead, "nome", "nome_completo", "contato"),
    );

    const status = normalizarTexto(
      formatarStatus(obterValorLead(lead, "status")),
    );

    const responsavel = normalizarTexto(
      obterValorLead(lead, "responsavel", "responsavel_sdr"),
    );

    const correspondePesquisa =
      empresa.includes(pesquisa) || contato.includes(pesquisa);

    const correspondeStatus =
      !statusSelecionado ||
      status === statusSelecionado ||
      (statusSelecionado === "contato" && status === "em contato") ||
      (statusSelecionado === "qualificacao" && status === "em qualificacao");

    const correspondeResponsavel =
      !responsavelSelecionado || responsavel === responsavelSelecionado;

    return correspondePesquisa && correspondeStatus && correspondeResponsavel;
  });

  renderizarTabelaDashboard(leadsFiltrados);
}

// ============================================
// CONFIGURAR EVENTOS DOS FILTROS
// ============================================

function configurarFiltrosDashboard() {
  campoPesquisa.addEventListener("input", filtrarLeadsDashboard);

  filtroStatus.addEventListener("change", filtrarLeadsDashboard);

  // O filtro antigo de prioridade não é mais utilizado.
  // Ele será removido do HTML na próxima etapa.

  filtroResponsavel?.addEventListener("change", filtrarLeadsDashboard);
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

    preencherFiltroResponsaveis(leadsDashboard);

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
