// ============================================
// LEADFLOW - ARQUIVO PRINCIPAL
// ============================================

// Verifica qual página está sendo acessada
const paginaAtual = window.location.pathname;

// ============================================
// INICIALIZAÇÃO DO DASHBOARD
// ============================================

function iniciarDashboard() {
  console.log("Dashboard iniciado.");

  // Futuramente, outras inicializações poderão ser adicionadas aqui.
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("LeadFlow iniciado.");

  // Identifica a página atual e executa sua inicialização
  if (paginaAtual.includes("dashboard.html")) {
    iniciarDashboard();
  }
});
