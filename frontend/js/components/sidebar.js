// ============================================
// LEADFLOW - BARRA LATERAL
// ============================================


// ============================================
// ABRIR E FECHAR SIDEBAR
// ============================================

function configurarBotaoSidebar() {
    const sidebar = document.getElementById("barraLateral");
    const botaoMenu = document.getElementById("botaoMenu");

    if (!sidebar || !botaoMenu) {
        return;
    }

    botaoMenu.addEventListener("click", () => {
        const estaAberta = sidebar.classList.toggle("aberta");

        botaoMenu.setAttribute(
            "aria-expanded",
            String(estaAberta)
        );
    });
}


// ============================================
// FECHAR SIDEBAR AO CLICAR FORA
// ============================================

function configurarFechamentoExterno() {
    const sidebar = document.getElementById("barraLateral");
    const botaoMenu = document.getElementById("botaoMenu");

    if (!sidebar || !botaoMenu) {
        return;
    }

    document.addEventListener("click", (evento) => {
        const clicouNaSidebar = sidebar.contains(evento.target);
        const clicouNoBotao = botaoMenu.contains(evento.target);

        if (!clicouNaSidebar && !clicouNoBotao) {
            sidebar.classList.remove("aberta");

            botaoMenu.setAttribute("aria-expanded", "false");
        }
    });
}


// ============================================
// FECHAR SIDEBAR COM ESC
// ============================================

function configurarTeclaEscSidebar() {
    const sidebar = document.getElementById("barraLateral");
    const botaoMenu = document.getElementById("botaoMenu");

    if (!sidebar || !botaoMenu) {
        return;
    }

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            sidebar.classList.remove("aberta");

            botaoMenu.setAttribute("aria-expanded", "false");
        }
    });
}


// ============================================
// IDENTIFICAR PÁGINA ATUAL
// ============================================

function destacarPaginaAtual() {
    const links = document.querySelectorAll(
        "#barraLateral a[href]"
    );

    const paginaAtual = window.location.pathname
        .split("/")
        .pop();

    links.forEach((link) => {
        const destino = link.getAttribute("href")
            .split("/")
            .pop()
            .split("?")[0];

        if (destino === paginaAtual) {
            link.classList.add("ativo");

            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("ativo");

            link.removeAttribute("aria-current");
        }
    });
}


// ============================================
// INICIALIZAÇÃO
// ============================================

function iniciarSidebar() {
    configurarBotaoSidebar();
    configurarFechamentoExterno();
    configurarTeclaEscSidebar();
    destacarPaginaAtual();
}

document.addEventListener("DOMContentLoaded", iniciarSidebar);