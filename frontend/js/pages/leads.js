// ============================================
// LEADFLOW - PÁGINA DE LEADS
// ============================================

// ============================================
// CONFIGURAR BOTÃO DE NOVO LEAD
// ============================================

function configurarBotaoNovoLead() {
  const botaoNovoLead = document.getElementById("botaoNovoLead");

  if (!botaoNovoLead) {
    return;
  }

  botaoNovoLead.addEventListener("click", () => {
    window.location.href = "leads_form.html";
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function iniciarPaginaLeads() {
  configurarBotaoNovoLead();

  console.log("Página de leads inicializada.");
}

document.addEventListener("DOMContentLoaded", iniciarPaginaLeads);
