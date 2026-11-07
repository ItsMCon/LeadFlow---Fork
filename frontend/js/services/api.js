// ============================================
// LEADFLOW - SERVIÇO DE COMUNICAÇÃO COM A API
// ============================================

// ============================================
// CONFIGURAÇÕES
// ============================================

// Endereço base do backend.
// Ajustar quando a Dupla 1 disponibilizar o servidor.

const URL_BASE_API = "http://localhost:3000/api";

// ============================================
// FUNÇÃO PRINCIPAL DE REQUISIÇÕES
// ============================================

async function requisicaoAPI(endpoint, opcoes = {}) {
  try {
    const resposta = await fetch(`${URL_BASE_API}${endpoint}`, {
      ...opcoes,

      headers: {
        "Content-Type": "application/json",
        ...opcoes.headers,
      },

      // Permite o envio e recebimento de cookies de sessão.
      credentials: "include",
    });

    // Tenta interpretar a resposta como JSON.
    const tipoConteudo = resposta.headers.get("content-type");

    const dados =
      tipoConteudo && tipoConteudo.includes("application/json")
        ? await resposta.json()
        : null;

    // Verifica se a requisição foi bem-sucedida.
    if (!resposta.ok) {
      throw new Error(
        dados?.message ||
          dados?.mensagem ||
          `Erro na requisição: ${resposta.status}`,
      );
    }

    return dados;
  } catch (erro) {
    console.error("Erro na comunicação com a API:", erro);

    throw erro;
  }
}

// ============================================
// MÉTODOS HTTP
// ============================================

// GET: buscar informações.
async function buscarAPI(endpoint) {
  return await requisicaoAPI(endpoint, {
    method: "GET",
  });
}

// POST: enviar informações ou cadastrar registros.
async function enviarAPI(endpoint, dados) {
  return await requisicaoAPI(endpoint, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// PUT: substituir informações de um registro.
async function substituirAPI(endpoint, dados) {
  return await requisicaoAPI(endpoint, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

// PATCH: atualizar parcialmente um registro.
async function atualizarAPI(endpoint, dados) {
  return await requisicaoAPI(endpoint, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

// DELETE: remover um registro.
async function deletarAPI(endpoint) {
  return await requisicaoAPI(endpoint, {
    method: "DELETE",
  });
}
