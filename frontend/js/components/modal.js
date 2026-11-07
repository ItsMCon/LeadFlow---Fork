// ============================================
// LEADFLOW - COMPONENTE DE MODAL
// ============================================


// ============================================
// ABRIR MODAL
// ============================================

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);

    if (!modal) {
        console.warn(`Modal "${idModal}" não encontrado.`);
        return;
    }

    modal.classList.add("aberto");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-aberto");
}


// ============================================
// FECHAR MODAL
// ============================================

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);

    if (!modal) {
        return;
    }

    modal.classList.remove("aberto");

    modal.setAttribute("aria-hidden", "true");

    // Só libera a rolagem se não houver outro modal aberto
    const existeOutroModalAberto =
        document.querySelector(".modal.aberto");

    if (!existeOutroModalAberto) {
        document.body.classList.remove("modal-aberto");
    }
}


// ============================================
// CONFIGURAR BOTÕES DOS MODAIS
// ============================================

function configurarBotoesModal() {
    const botoesAbrir = document.querySelectorAll(
        "[data-abrir-modal]"
    );

    const botoesFechar = document.querySelectorAll(
        "[data-fechar-modal]"
    );

    // Botões que abrem os modais
    botoesAbrir.forEach((botao) => {
        botao.addEventListener("click", () => {
            const idModal = botao.dataset.abrirModal;

            abrirModal(idModal);
        });
    });

    // Botões que fecham os modais
    botoesFechar.forEach((botao) => {
        botao.addEventListener("click", () => {
            const modal = botao.closest(".modal");

            if (modal) {
                fecharModal(modal.id);
            }
        });
    });
}


// ============================================
// FECHAR AO CLICAR FORA DO CONTEÚDO
// ============================================

function configurarFechamentoExterno() {
    const modais = document.querySelectorAll(".modal");

    modais.forEach((modal) => {
        modal.addEventListener("click", (evento) => {

            // Fecha apenas se o clique ocorrer no fundo do modal
            if (evento.target === modal) {
                fecharModal(modal.id);
            }

        });
    });
}


// ============================================
// FECHAR COM A TECLA ESC
// ============================================

function configurarTeclaEsc() {
    document.addEventListener("keydown", (evento) => {

        if (evento.key !== "Escape") {
            return;
        }

        const modaisAbertos = document.querySelectorAll(
            ".modal.aberto"
        );

        // Fecha o último modal aberto
        const ultimoModal =
            modaisAbertos[modaisAbertos.length - 1];

        if (ultimoModal) {
            fecharModal(ultimoModal.id);
        }
    });
}


// ============================================
// INICIALIZAÇÃO
// ============================================

function iniciarModais() {
    configurarBotoesModal();
    configurarFechamentoExterno();
    configurarTeclaEsc();
}

document.addEventListener("DOMContentLoaded", iniciarModais);