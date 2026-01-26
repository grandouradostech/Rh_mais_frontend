import { api } from './core/api.js';
import { createEmployeeCard } from './components/card.component.js';
import { ModalComponent } from './components/modal.component.js';
import { AdminComponent } from './components/admin.component.js';

// Verifica sessão
if (!sessionStorage.getItem('accessToken')) {
    window.location.href = '/login.html';
}

const state = {
    colaboradores: [],
    filtroTexto: ''
};

const elements = {
    container: document.getElementById('dashboard-container'),
    searchBar: document.getElementById('search-bar'),
    logoutBtn: document.getElementById('nav-sair'),
    modalCloseBtn: document.getElementById('btn-fechar-modal'),
    modalOverlay: document.getElementById('modal-detalhes'),
    
    // Navegação
    navColab: document.getElementById('nav-colaboradores'),
    navAdmin: document.getElementById('nav-admin'),
    viewColab: document.getElementById('view-colaboradores'),
    viewAdmin: document.getElementById('view-admin'),
    mainHeader: document.querySelector('#main-header h1'),

    // Sidebar Info
    sidebarName: document.getElementById('sidebar-user-name'),
    sidebarRole: document.getElementById('sidebar-user-role')
};

async function init() {
    setupEventListeners();
    checkAdminPermission();
    atualizarInfoUsuario(); // <--- Chamada correta
    await carregarColaboradores();
}

// === CORREÇÃO AQUI: Nome da função corrigido ===
function atualizarInfoUsuario() {
    const nome = sessionStorage.getItem('usuarioNome');
    const role = sessionStorage.getItem('usuarioRole');

    if (elements.sidebarName) {
        elements.sidebarName.textContent = nome || 'Usuário';
    }
    if (elements.sidebarRole) {
        let cargoExibicao = 'Colaborador';
        if (role === 'admin') cargoExibicao = 'Administrador';
        if (role === 'gestor') cargoExibicao = 'Gestor';
        
        elements.sidebarRole.textContent = cargoExibicao;
    }
}

function checkAdminPermission() {
    const role = sessionStorage.getItem('usuarioRole');
    if (role === 'admin') {
        if (elements.navAdmin) elements.navAdmin.style.display = 'flex';
    }
}

function setupEventListeners() {
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            api.logout();
        });
    }

    if (elements.navColab) {
        elements.navColab.addEventListener('click', (e) => {
            e.preventDefault();
            alternarVisao('colaboradores');
        });
    }

    if (elements.navAdmin) {
        elements.navAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            alternarVisao('admin');
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

    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener('click', ModalComponent.fechar);
    }
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) ModalComponent.fechar();
        });
    }
    
    // Global Click Handler para os Cards
    window.abrirDetalhesColaborador = (index) => {
        const colab = state.colaboradores[index];
        if (colab) {
            ModalComponent.abrir(colab);
        }
    };
}

function alternarVisao(visao) {
    if (elements.navColab) elements.navColab.classList.remove('active');
    if (elements.navAdmin) elements.navAdmin.classList.remove('active');

    if (visao === 'colaboradores') {
        if (elements.navColab) elements.navColab.classList.add('active');
        if (elements.viewColab) elements.viewColab.style.display = 'block';
        if (elements.viewAdmin) elements.viewAdmin.style.display = 'none';
        if (elements.mainHeader) elements.mainHeader.textContent = 'Colaboradores';
    } 
    else if (visao === 'admin') {
        if (elements.navAdmin) elements.navAdmin.classList.add('active');
        if (elements.viewColab) elements.viewColab.style.display = 'none';
        if (elements.viewAdmin) elements.viewAdmin.style.display = 'block';
        if (elements.mainHeader) elements.mainHeader.textContent = 'Gestão de Acessos';
        
        AdminComponent.render('admin-container');
    }
}

async function carregarColaboradores() {
    try {
        const resposta = await api.get('/api/colaboradores');
        if (resposta.sucesso) {
            state.colaboradores = resposta.dados;
            renderizar();
        } else {
            tratarErroCarregamento(resposta.erro || resposta.error);
        }
    } catch (error) {
        console.error(error);
        tratarErroCarregamento('Erro inesperado de conexão.');
    }
}

function tratarErroCarregamento(msgRaw) {
    const mensagem = /failed to fetch|networkerror/i.test(String(msgRaw))
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        : String(msgRaw || 'Erro desconhecido');

    if (elements.container) {
        elements.container.innerHTML = `
            <div>
                <p class="error-message">${mensagem}</p>
                <button id="btn-retry" style="padding: 10px 14px; border: none; border-radius: 6px; background: #4a69e2; color: #fff; cursor: pointer;">Tentar novamente</button>
            </div>
        `;
        const btnRetry = document.getElementById('btn-retry');
        if (btnRetry) btnRetry.addEventListener('click', () => carregarColaboradores());
    }
}

function renderizar() {
    if (!elements.container) return;
    elements.container.innerHTML = '';

    const filtrados = state.colaboradores.filter(colab => {
        const nome = (colab.nome || '').toLowerCase();
        return nome.includes(state.filtroTexto);
    });

    const html = filtrados.map((colab) => {
        const indexReal = state.colaboradores.indexOf(colab);
        return createEmployeeCard(colab, indexReal);
    }).join('');
    
    elements.container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);