// ============================================
// LEADFLOW - SERVIÇO DE AUTENTICAÇÃO
// ============================================

// ============================================
// CONFIGURAÇÕES
// ============================================

// api.js deve ser carregado antes deste arquivo.
const URL_API_AUTENTICACAO = `${URL_BASE_API}/auth`;

// ============================================
// AUTENTICAR USUÁRIO
// ============================================

async function autenticarUsuario(email, senha) {
  try {
    const resposta = await fetch(`${URL_API_AUTENTICACAO}/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      // Permite o envio e recebimento de cookies de sessão.
      credentials: "include",

      body: JSON.stringify({
        email: email,
        senha: senha,
      }),
    });

    // Evita erro caso o servidor não retorne JSON.
    const tipoConteudo = resposta.headers.get("content-type");

    const dados =
      tipoConteudo && tipoConteudo.includes("application/json")
        ? await resposta.json()
        : {};

    // Verifica se a autenticação foi bem-sucedida.
    if (!resposta.ok) {
      throw new Error(
        dados.message || dados.mensagem || "Não foi possível realizar o login.",
      );
    }

    return {
      sucesso: true,
      usuario: dados.usuario || null,
      mensagem:
        dados.message || dados.mensagem || "Login realizado com sucesso.",
    };
  } catch (erro) {
    console.error("Erro na autenticação:", erro);

    return {
      sucesso: false,
      usuario: null,
      mensagem: erro.message || "Erro ao conectar com o servidor.",
    };
  }
}

// ============================================
// OBTER URL DE AUTENTICAÇÃO
// ============================================

function obterUrlAutenticacao() {
  return URL_API_AUTENTICACAO;
}
