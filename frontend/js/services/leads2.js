// ============================================
// LEADFLOW - SERVIÇO DE GERENCIAMENTO DE LEADS
// ============================================

// ============================================
// CONFIGURAÇÃO DO ARMAZENAMENTO
// ============================================

// true: utiliza localStorage durante o desenvolvimento.
// false: utiliza a API do backend.

const USAR_ARMAZENAMENTO_LOCAL = true;

const CHAVE_LEADS = "leadflow_leads";

// ============================================
// DADOS FICTÍCIOS INICIAIS
// ============================================

// Utilizados somente quando ainda não existem
// leads salvos no localStorage.

const leadsIniciais = [
  {
    id: "lead-001",
    nome: "Carlos Mendes",
    empresa: "Tech Solutions",
    email: "carlos@techsolutions.com",
    telefone: "(21) 99999-1111",
    segmento: "Tecnologia",
    prioridade: "Alta",
    justificativa: "Empresa com alto potencial de contratação.",
    abordagem: "Apresentar soluções de automação comercial.",
    status: "Novo",
    responsavel: "Ana Silva",
    origem: "Site",
    descricao: "Interesse em automatizar processos comerciais.",
    observacoes: "Demonstrou interesse nos serviços.",
    dataCadastro: "2026-11-01T10:00:00.000Z",
    dataAtualizacao: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "lead-002",
    nome: "Mariana Costa",
    empresa: "Educa Mais",
    email: "mariana@educamais.com",
    telefone: "(21) 99999-2222",
    segmento: "Educação",
    prioridade: "Média",
    justificativa: "Possui potencial de crescimento.",
    abordagem: "Investigar necessidades de automação.",
    status: "Em contato",
    responsavel: "Pedro Santos",
    origem: "Indicação",
    descricao: "Busca melhorar os processos internos da empresa.",
    observacoes: "Aguardando retorno da empresa.",
    dataCadastro: "2026-11-02T10:00:00.000Z",
    dataAtualizacao: "2026-11-02T10:00:00.000Z",
  },
  {
    id: "lead-003",
    nome: "Roberto Lima",
    empresa: "Health Corp",
    email: "roberto@healthcorp.com",
    telefone: "(21) 99999-3333",
    segmento: "Saúde",
    prioridade: "Baixa",
    justificativa: "Potencial de contratação ainda não identificado.",
    abordagem: "Realizar contato inicial para identificar necessidades.",
    status: "Convertido",
    responsavel: "Ana Silva",
    origem: "Prospecção",
    descricao: "Interesse em conhecer as soluções disponíveis.",
    observacoes: "Contrato concluído.",
    dataCadastro: "2026-11-03T10:00:00.000Z",
    dataAtualizacao: "2026-11-03T10:00:00.000Z",
  },
];

// ============================================
// FUNÇÕES AUXILIARES DO ARMAZENAMENTO
// ============================================

function obterLeadsArmazenados() {
  const dadosSalvos = localStorage.getItem(CHAVE_LEADS);

  // Inicializa os dados fictícios na primeira utilização.
  if (dadosSalvos === null) {
    salvarLeadsArmazenados(leadsIniciais);

    return [...leadsIniciais];
  }

  const leads = JSON.parse(dadosSalvos);

  if (!Array.isArray(leads)) {
    throw new Error("Os dados armazenados dos leads são inválidos.");
  }

  return leads;
}

function salvarLeadsArmazenados(leads) {
  localStorage.setItem(CHAVE_LEADS, JSON.stringify(leads));
}

function gerarIdLead() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function obterDataAtual() {
  return new Date().toISOString();
}

// ============================================
// BUSCAR TODOS OS LEADS
// ============================================

async function buscarTodosOsLeads() {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      return obterLeadsArmazenados();
    }

    const resposta = await buscarAPI("/leads");

    return resposta?.leads ?? resposta;
  } catch (erro) {
    console.error("Erro ao buscar leads:", erro);

    throw erro;
  }
}

// ============================================
// COMPATIBILIDADE COM A LISTAGEM
// ============================================

async function buscarLeads() {
  return await buscarTodosOsLeads();
}

// ============================================
// BUSCAR UM LEAD PELO ID
// ============================================

async function buscarLeadPorId(id) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      return leads.find((lead) => lead.id === id) || null;
    }

    const resposta = await buscarAPI(`/leads/${encodeURIComponent(id)}`);

    return resposta?.lead ?? resposta;
  } catch (erro) {
    console.error("Erro ao buscar lead:", erro);

    throw erro;
  }
}

// ============================================
// CADASTRAR UM NOVO LEAD
// ============================================

async function cadastrarLead(dados) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      const dataAtual = obterDataAtual();

      const novoLead = {
        ...dados,
        id: gerarIdLead(),
        prioridade: "Média",
        justificativa: "Aguardando classificação da IA.",
        abordagem: "Aguardando sugestão de abordagem.",
        status: "Novo",
        dataCadastro: dataAtual,
        dataAtualizacao: dataAtual,
      };

      leads.push(novoLead);

      salvarLeadsArmazenados(leads);

      return novoLead;
    }

    const resposta = await enviarAPI("/leads", dados);

    return resposta;
  } catch (erro) {
    console.error("Erro ao cadastrar lead:", erro);

    throw erro;
  }
}

// ============================================
// EDITAR UM LEAD EXISTENTE
// ============================================

async function editarLead(id, dados) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      const indice = leads.findIndex((lead) => lead.id === id);

      if (indice === -1) {
        throw new Error("Lead não encontrado para edição.");
      }

      const leadAtualizado = {
        ...leads[indice],
        ...dados,

        // Preserva o identificador original.
        id: leads[indice].id,

        // Preserva a data de cadastro.
        dataCadastro: leads[indice].dataCadastro,

        // Atualiza a data da última modificação.
        dataAtualizacao: obterDataAtual(),
      };

      leads[indice] = leadAtualizado;

      salvarLeadsArmazenados(leads);

      return leadAtualizado;
    }

    const resposta = await atualizarAPI(
      `/leads/${encodeURIComponent(id)}`,
      dados,
    );

    return resposta;
  } catch (erro) {
    console.error("Erro ao editar lead:", erro);

    throw erro;
  }
}

// ============================================
// ATUALIZAR O STATUS DE UM LEAD
// ============================================

async function atualizarStatusLead(id, novoStatus) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      const indice = leads.findIndex((lead) => lead.id === id);

      if (indice === -1) {
        throw new Error("Lead não encontrado.");
      }

      leads[indice].status = novoStatus;
      leads[indice].dataAtualizacao = obterDataAtual();

      salvarLeadsArmazenados(leads);

      return leads[indice];
    }

    const resposta = await atualizarAPI(
      `/leads/${encodeURIComponent(id)}/status`,
      {
        status: novoStatus,
      },
    );

    return resposta;
  } catch (erro) {
    console.error("Erro ao atualizar status do lead:", erro);

    throw erro;
  }
}

// ============================================
// ATUALIZAR O RESPONSÁVEL PELO LEAD
// ============================================

async function atualizarResponsavelLead(id, novoResponsavel) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      const indice = leads.findIndex((lead) => lead.id === id);

      if (indice === -1) {
        throw new Error("Lead não encontrado.");
      }

      leads[indice].responsavel = novoResponsavel;
      leads[indice].dataAtualizacao = obterDataAtual();

      salvarLeadsArmazenados(leads);

      return leads[indice];
    }

    const resposta = await atualizarAPI(
      `/leads/${encodeURIComponent(id)}/responsible`,
      {
        responsavel: novoResponsavel,
      },
    );

    return resposta;
  } catch (erro) {
    console.error("Erro ao atualizar responsável:", erro);

    throw erro;
  }
}

// ============================================
// EXCLUIR UM LEAD
// ============================================

// Esta função só deve ser utilizada se a API
// disponibilizar a exclusão de leads.

async function excluirLead(id) {
  try {
    if (USAR_ARMAZENAMENTO_LOCAL) {
      const leads = obterLeadsArmazenados();

      const novosLeads = leads.filter((lead) => lead.id !== id);

      if (novosLeads.length === leads.length) {
        throw new Error("Lead não encontrado para exclusão.");
      }

      salvarLeadsArmazenados(novosLeads);

      return {
        mensagem: "Lead excluído com sucesso.",
      };
    }

    const resposta = await deletarAPI(`/leads/${encodeURIComponent(id)}`);

    return resposta;
  } catch (erro) {
    console.error("Erro ao excluir lead:", erro);

    throw erro;
  }
}
