import { formatarData, obterDataHoje } from '../core/utils.js';

let _listaAtual = [];
let _colabIdAtual = null;

// Configuração de Questionários
const QUESTIONARIO = {
    TECNICO: [
        "O colaborador possui o conhecimento técnico necessário?",
        "As entregas têm qualidade e cumprem prazos?",
        "Resolve problemas com autonomia?",
        "Necessita treinamento específico? (Qual?)"
    ],
    COMPORTAMENTAL: [
        "Demonstra comprometimento?",
        "Comunica-se bem com a equipe?",
        "Trabalha bem em equipe?",
        "Lida bem com feedbacks?"
    ],
    BEMESTAR: [
        "Aparenta estar emocionalmente bem?",
        "Sinais de estresse ou sobrecarga?",
        "Mantém motivação e foco?",
        "Precisa de apoio da liderança?"
    ]
};

export const FeedbackComponent = {
    render(listaFeedbacksAPI, colabId, podeEditar) {
        _colabIdAtual = colabId;
        const dadosLocais = localStorage.getItem(`db_feedbacks_${colabId}`);
        _listaAtual = dadosLocais ? JSON.parse(dadosLocais) : (listaFeedbacksAPI || []);

        let html = `
            <div id="feedback-view-mode">
                ${podeEditar ? `
                <div style="text-align: right; margin-bottom: 15px;">
                    <button id="btn-novo-feedback-interno" class="btn-salvar" style="background: #4a69e2;">
                        + Nova Avaliação Estratégica
                    </button>
                </div>` : ''}
                <div class="feedback-list">
        `;

        if (_listaAtual.length === 0) {
            html += '<div class="empty-state" style="padding:40px; text-align:center; color:#777;">Nenhum ciclo de feedback aberto.</div>';
        } else {
            _listaAtual.forEach((item, index) => {
                html += this.renderizarCardFeedback(item, index, podeEditar);
            });
        }
        
        html += `</div></div><div id="feedback-form-mode" style="display:none;"></div>`;
        return html;
    },

    renderizarCardFeedback(item, index, podeEditar) {
        const cat = (item.categoria || 'GERAL').toUpperCase();
        const tagClass = cat === 'TECNICO' ? 'tag-tecnico' : (cat === 'BEMESTAR' ? 'tag-bemestar' : 'tag-comportamental');
        
        // Sistema de Status
        const statusMap = {
            'CRIADO': { label: 'Criado', color: '#6c757d' },
            'AGUARDANDO_EVIDENCIA': { label: 'Aguardando Evidência', color: '#ffc107' },
            'CONCLUIDO': { label: 'Concluído', color: '#28a745' },
            'AVALIADO': { label: 'Avaliado', color: '#192A56' }
        };
        const st = statusMap[item.status] || { label: item.status, color: '#000' };

        return `
            <div class="feedback-card" style="border-left: 5px solid ${st.color};">
                <div class="feedback-header">
                    <div>
                        <span class="tag-categoria ${tagClass}">${cat}</span>
                        <span class="status-badge-small" style="background:${st.color}; color:white; padding:2px 8px; border-radius:10px; font-size:0.7em; margin-left:10px;">${st.label}</span>
                    </div>
                    <span style="font-size:0.85em; color:#666;">${formatarData(item.data)}</span>
                </div>
                <div class="feedback-body">
                    <details>
                        <summary style="cursor:pointer; color:#4a69e2; font-size:0.9em; margin-bottom:10px;">Ver Diagnóstico Inicial</summary>
                        <div class="feedback-text" style="white-space: pre-line; font-size:0.85em; background:#f9f9f9; padding:10px; border-radius:4px;">${item.observacao}</div>
                    </details>

                    ${item.planoAcao ? `
                    <div class="feedback-section desafio-box" style="margin-top:10px;">
                        <h5 style="color:#856404; margin-bottom:5px;">Plano de Ação: ${item.planoAcao.titulo}</h5>
                        <p style="margin:0; font-size:0.9em;">${item.planoAcao.descricao}</p>
                        <div style="margin-top:5px; font-size:0.8em; display:flex; gap:15px; color:#666;">
                            <span><strong>Prazo:</strong> ${formatarData(item.planoAcao.prazo)}</span>
                            <span><strong>Exige Evidência:</strong> ${item.planoAcao.exigeEvidencia ? 'Sim' : 'Não'}</span>
                        </div>
                    </div>` : ''}

                    ${item.evidencias ? `
                    <div class="evidencia-link" style="margin-top:10px; padding:8px; background:#e3f2fd; border-radius:4px; font-size:0.9em;">
                        <strong>Evidência enviada:</strong> <a href="${item.evidencias.url}" target="_blank">${item.evidencias.tipo}</a>
                    </div>` : ''}

                    ${item.avaliacaoFinal ? `
                    <div class="rating-display" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                        <strong>Avaliação do Gestor:</strong> ${'⭐'.repeat(item.avaliacaoFinal.rating)}
                        <p style="font-style:italic; font-size:0.85em; margin:5px 0 0 0;">"${item.avaliacaoFinal.comentario}"</p>
                    </div>` : ''}
                </div>
                <div class="feedback-footer">
                    ${this.renderizarAcoesStatus(item, index, podeEditar)}
                </div>
            </div>
        `;
    },

    renderizarAcoesStatus(item, index, podeEditar) {
        // Lógica de transição de status
        if (item.status === 'CRIADO' && item.planoAcao?.exigeEvidencia) {
            return `<button onclick="window.atualizarStatusFeedback(${index}, 'AGUARDANDO_EVIDENCIA')" class="btn-salvar" style="font-size:0.8em; background:#ffc107; color:black;">Solicitar Comprovação</button>`;
        }
        
        if (item.status === 'AGUARDANDO_EVIDENCIA') {
            return `<button onclick="window.enviarEvidenciaPrompt(${index})" class="btn-salvar" style="font-size:0.8em; background:#28a745;">Enviar Evidência</button>`;
        }

        if (item.status === 'CONCLUIDO' && podeEditar) {
            return `<button onclick="window.avaliarFeedbackPrompt(${index})" class="btn-salvar" style="font-size:0.8em; background:#192A56;">Avaliar Resultado</button>`;
        }

        return `<span style="color:#999; font-size:0.8em;">Ciclo finalizado em ${formatarData(item.dataConclusao || item.data)}</span>`;
    },

    alternarParaFormulario() {
        const viewMode = document.getElementById('feedback-view-mode');
        const formMode = document.getElementById('feedback-form-mode');
        
        formMode.innerHTML = `
            <div class="form-feedback">
                <h3 style="margin-top:0; color:#192A56;">Novo Ciclo de Desenvolvimento</h3>
                <form id="form-novo-feedback">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Categoria</label>
                            <select id="input-categoria" class="form-control" required>
                                <option value="TECNICO">Técnico (Cursos/Certificações)</option>
                                <option value="COMPORTAMENTAL">Comportamental (Atitude)</option>
                                <option value="BEMESTAR">Bem-estar</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Data</label><input type="date" id="input-data" class="form-control" value="${obterDataHoje()}"></div>
                    </div>

                    <div id="questoes-dinamicas" style="background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #eee;"></div>

                    <div class="plano-acao-box" style="border: 1px solid #ffeeba; background:#fffcf5; padding:15px; border-radius:8px;">
                        <h4 style="margin:0 0 10px 0; color:#856404;">Plano de Ação (Desafio)</h4>
                        <div class="form-group"><label>O que deve ser feito?</label><input type="text" id="pa-titulo" class="form-control" placeholder="Ex: Certificação AWS Cloud Practitioner" required></div>
                        <div class="form-group"><label>Detalhes/Objetivo</label><textarea id="pa-desc" class="form-control" rows="2"></textarea></div>
                        <div style="display: flex; gap:20px; align-items:center;">
                            <div class="form-group" style="flex:1;"><label>Prazo</label><input type="date" id="pa-prazo" class="form-control"></div>
                            <div class="form-group" style="padding-top:20px;">
                                <label style="display:flex; align-items:center; cursor:pointer;">
                                    <input type="checkbox" id="pa-evidencia" style="margin-right:8px;" checked> Exigir Evidência
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions" style="margin-top:15px;">
                        <button type="button" id="btn-cancelar-form" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-salvar">Abrir Ciclo</button>
                    </div>
                </form>
            </div>
        `;

        viewMode.style.display = 'none';
        formMode.style.display = 'block';

        const selectCat = document.getElementById('input-categoria');
        selectCat.addEventListener('change', () => this.renderizarPerguntas(selectCat.value));
        this.renderizarPerguntas(selectCat.value);

        document.getElementById('btn-cancelar-form').onclick = () => { formMode.style.display = 'none'; viewMode.style.display = 'block'; };
        document.getElementById('form-novo-feedback').onsubmit = (e) => { e.preventDefault(); this.salvarFeedback(); };
    },

    renderizarPerguntas(categoria) {
        const container = document.getElementById('questoes-dinamicas');
        container.innerHTML = (QUESTIONARIO[categoria] || []).map(p => `
            <div class="form-group"><label style="font-weight:500;">${p}</label>
            <textarea class="form-control resposta-pergunta" data-pergunta="${p}" required rows="1"></textarea></div>
        `).join('');
    },

    salvarFeedback() {
        const respostas = Array.from(document.querySelectorAll('.resposta-pergunta')).map(el => `Q: ${el.dataset.pergunta}\nR: ${el.value}`).join('\n\n');

        const novoItem = {
            id: Date.now(),
            data: document.getElementById('input-data').value,
            categoria: document.getElementById('input-categoria').value,
            observacao: respostas,
            status: 'CRIADO',
            planoAcao: {
                titulo: document.getElementById('pa-titulo').value,
                descricao: document.getElementById('pa-desc').value,
                prazo: document.getElementById('pa-prazo').value,
                exigeEvidencia: document.getElementById('pa-evidencia').checked
            },
            historico: [{ data: new Date().toISOString(), acao: 'Ciclo Iniciado' }]
        };

        _listaAtual.unshift(novoItem);
        this.persistirERenderizar();
    },

    persistirERenderizar() {
        localStorage.setItem(`db_feedbacks_${_colabIdAtual}`, JSON.stringify(_listaAtual));
        const tab = document.getElementById('tab-feedbacks');
        // Pega a role do sessionStorage para manter permissão no re-render
        const podeEditar = sessionStorage.getItem('usuarioRole') === 'admin' || sessionStorage.getItem('usuarioRole') === 'gestor';
        tab.innerHTML = this.render(_listaAtual, _colabIdAtual, podeEditar);
        this.setupEvents();
    },

    setupEvents() {
        const btnNovo = document.getElementById('btn-novo-feedback-interno');
        if (btnNovo) btnNovo.onclick = () => this.alternarParaFormulario();
    }
};

// Funções Globais de Workflow
window.atualizarStatusFeedback = (index, novoStatus) => {
    _listaAtual[index].status = novoStatus;
    FeedbackComponent.persistirERenderizar();
};

window.enviarEvidenciaPrompt = (index) => {
    const url = prompt("Insira o link da evidência (Certificado, PDF, Documento):");
    if (url) {
        _listaAtual[index].evidencias = { url, tipo: 'Link Externo/Arquivo', data: new Date().toISOString() };
        _listaAtual[index].status = 'CONCLUIDO';
        _listaAtual[index].dataConclusao = obterDataHoje();
        FeedbackComponent.persistirERenderizar();
    }
};

window.avaliarFeedbackPrompt = (index) => {
    const rating = prompt("Avalie o resultado de 1 a 5 stars:");
    const comentario = prompt("Comentário final do gestor:");
    if (rating && comentario) {
        _listaAtual[index].avaliacaoFinal = { rating: parseInt(rating), comentario, data: new Date().toISOString() };
        _listaAtual[index].status = 'AVALIADO';
        FeedbackComponent.persistirERenderizar();
    }
};