import { api } from './core/api.js';
import { createEmployeeCard } from './components/card.component.js';
import { ModalComponent } from './components/modal.component.js';


if (!sessionStorage.getItem('accessToken')) {
    window.location.href = 'login.html';
}

const state = {
    colaboradores: [],
    filtroTexto: ''
};

const elements = {
    container: document.getElementById('dashboard-container'),
    searchBar: document.getElementById('search-bar'),
    logoutBtn: document.getElementById('nav-sair'),
    modalCloseBtn: document.getElementById('btn-fechar-modal'), // <--- NOVO
    modalOverlay: document.getElementById('modal-detalhes')     // <--- NOVO
};

async function init() {
    setupEventListeners();
    await carregarColaboradores();
}

function setupEventListeners() {
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            api.logout();
        });
    }

    let timeout;
    if (elements.searchBar) {
        elements.searchBar.addEventListener('input', (e) => {
            clearTimeout(timeout);
            state.filtroTexto = e.target.value.toLowerCase();
            timeout = setTimeout(renderizar, 300);
        });
    }

    // Eventos do Modal
    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener('click', ModalComponent.fechar);
    }
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) ModalComponent.fechar();
        });
    }
    
    // EXPOR A FUNÇÃO GLOBALMENTE PARA O ONCLICK FUNCIONAR
    window.abrirDetalhesColaborador = (index) => {
        const colab = state.colaboradores[index];
        if (colab) {
            ModalComponent.abrir(colab);
        }
    };
}

async function carregarColaboradores() {
    try {
        const resposta = await api.get('/api/colaboradores');
        if (resposta.sucesso) {
            state.colaboradores = resposta.dados;
            renderizar();
        } else {
            elements.container.innerHTML = '<p>Erro ao carregar dados.</p>';
        }
    } catch (error) {
        console.error(error);
    }
}

function renderizar() {
    if (!elements.container) return;
    elements.container.innerHTML = '';

    const filtrados = state.colaboradores.filter(colab => {
        const nome = (colab.nome || '').toLowerCase();
        return nome.includes(state.filtroTexto);
    });

    // Passamos o index original para conseguir abrir o modal correto
    const html = filtrados.map((colab) => {
        // Precisamos achar o índice real dele no array original state.colaboradores
        const indexReal = state.colaboradores.indexOf(colab);
        return createEmployeeCard(colab, indexReal);
    }).join('');
    
    elements.container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);