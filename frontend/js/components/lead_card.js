// ============================================
// LEADFLOW - COMPONENTE DE CARD DE LEAD
// ============================================

// ============================================
// ATUALIZAÇÃO DA PRIORIDADE
// ============================================

function atualizarPrioridadeCard(card, prioridade) {
  const elementoPrioridade = card.querySelector(".lead-prioridade");

  if (!elementoPrioridade) {
    return;
  }

  elementoPrioridade.textContent = prioridade;

  // Remove as classes anteriores de prioridade
  elementoPrioridade.classList.remove("alta", "media", "baixa");

  // Adiciona a classe correspondente
  elementoPrioridade.classList.add(prioridade.toLowerCase());
}

// ============================================
// ATUALIZAÇÃO DO STATUS
// ============================================

function atualizarStatusCard(card, status) {
  const elementoStatus = card.querySelector(".lead-status");

  if (!elementoStatus) {
    return;
  }

  elementoStatus.textContent = status;

  elementoStatus.classList.remove(
    "novo",
    "em-contato",
    "convertido",
    "perdido",
  );

  const classesStatus = {
    Novo: "novo",
    "Em contato": "em-contato",
    Convertido: "convertido",
    Perdido: "perdido",
  };

  const classeCorrespondente = classesStatus[status];

  if (classeCorrespondente) {
    elementoStatus.classList.add(classeCorrespondente);
  }
}

// ============================================
// CONFIGURAÇÃO DOS CARDS
// ============================================

function configurarCardsLeads() {
  const cards = document.querySelectorAll(".lead-card");

  cards.forEach((card) => {
    // Botão para visualizar os detalhes do lead
    const botaoDetalhes = card.querySelector(".botao-detalhes");

    if (botaoDetalhes) {
      botaoDetalhes.addEventListener("click", () => {
        const idLead = card.dataset.id;

        if (!idLead) {
          console.warn("Card sem identificador de lead.");
          return;
        }

        window.location.href = `lead-details.html?id=${encodeURIComponent(idLead)}`;
      });
    }
  });
}

// ============================================
// INICIALIZAÇÃO DO COMPONENTE
// ============================================

function iniciarLeadCards() {
  configurarCardsLeads();
}

document.addEventListener("DOMContentLoaded", iniciarLeadCards);
