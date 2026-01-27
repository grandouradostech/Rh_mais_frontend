import { formatarData, obterDataHoje } from '../core/utils.js';

let _listaAtual = [];
let _colabIdAtual = null;

// Configuração das perguntas por categoria
const QUESTIONARIO = {
    TECNICO: [
        "O colaborador possui o conhecimento técnico necessário para executar bem suas atividades?",
        "As entregas têm qualidade e cumprem os prazos esperados?",
        "Consegue resolver problemas técnicos do dia a dia com autonomia?",
        "Existe necessidade de treinamento, curso ou capacitação técnica para melhorar o desempenho? (Se sim, qual?)"
    ],
    COMPORTAMENTAL: [
        "Demonstra comprometimento e responsabilidade no trabalho?",
        "Comunica-se bem com a equipe e com a liderança?",
        "Trabalha bem em equipe e respeita os colegas?",
        "Lida bem com feedbacks e busca melhorar continuamente?"
    ],
    BEMESTAR: [
        "O colaborador aparenta estar emocionalmente bem no ambiente de trabalho?",
        "Demonstra sinais de estresse excessivo ou sobrecarga?",
        "Consegue manter motivação e foco nas atividades?",
        "Precisa de algum apoio da empresa ou da liderança neste momento?"
    ]
};

export const FeedbackComponent = {
    render(listaFeedbacksAPI, colabId) {
        _colabIdAtual = colabId;
        const dadosLocais = localStorage.getItem(`db_feedbacks_${colabId}`);
        _listaAtual = dadosLocais ? JSON.parse(dadosLocais) : (listaFeedbacksAPI || []);

        let html = `
            <div id="feedback-view-mode">
                <div style="text-align: right; margin-bottom: 15px;">
                    <button id="btn-novo-feedback-interno" class="btn-salvar" style="background: #4a69e2;">
                        + Nova Avaliação Guiada
                    </button>
                </div>
                <div class="feedback-list">
        `;

        if (_listaAtual.length === 0) {
            html += '<div class="empty-state" style="padding:40px; text-align:center; color:#777;">Nenhum feedback registrado.</div>';
        } else {
            _listaAtual.forEach(item => {
                const cat = (item.categoria || 'GERAL').toUpperCase();
                const tagClass = cat === 'TECNICO' ? 'tag-tecnico' : (cat === 'BEMESTAR' ? 'tag-bemestar' : 'tag-comportamental');

                html += `
                    <div class="feedback-card">
                        <div class="feedback-header">
                            <span class="tag-categoria ${tagClass}">${cat}</span>
                            <span style="font-size:0.85em; color:#666;">${formatarData(item.data)}</span>
                        </div>
                        <div class="feedback-body">
                            <div class="feedback-section">
                                <h5>Avaliação Detalhada</h5>
                                <div class="feedback-text" style="white-space: pre-line; background: #fcfcfc; padding: 10px; border-radius: 4px; border: 1px inset #eee;">
                                    ${item.observacao || '-'}
                                </div>
                            </div>
                            ${item.desafio ? `
                            <div class="feedback-section desafio-box">
                                <h5 style="color:#856404;">Plano de Ação / Desafio</h5>
                                <div class="feedback-text"><strong>Meta:</strong> ${item.desafio}</div>
                            </div>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        html += `</div></div><div id="feedback-form-mode" style="display:none;"></div>`;
        return html;
    },

    setupEvents() {
        const btnNovo = document.getElementById('btn-novo-feedback-interno');
        if (btnNovo) btnNovo.addEventListener('click', () => this.alternarParaFormulario());
    },

    alternarParaFormulario() {
        const viewMode = document.getElementById('feedback-view-mode');
        const formMode = document.getElementById('feedback-form-mode');
        if(!viewMode || !formMode) return;

        formMode.innerHTML = `
            <div class="form-feedback">
                <h3 style="margin-top:0; color:#192A56; border-bottom: 2px solid #eee; padding-bottom: 10px;">Novo Registro de Performance</h3>
                <form id="form-novo-feedback">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Categoria da Avaliação</label>
                            <select id="input-categoria" class="form-control" required>
                                <option value="TECNICO">Técnico (Hard Skills)</option>
                                <option value="COMPORTAMENTAL" selected>Comportamental (Soft Skills)</option>
                                <option value="BEMESTAR">Bem-estar / Saúde Mental</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Data</label><input type="date" id="input-data" class="form-control" value="${obterDataHoje()}" required></div>
                    </div>

                    <div id="questoes-dinamicas" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        </div>

                    <div class="form-group">
                        <label>Plano de Ação (Desafio para o colaborador)</label>
                        <textarea id="input-desafio" class="form-control" placeholder="O que o colaborador deve fazer para melhorar ou manter o nível?" rows="2"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="btn-cancelar-form" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-salvar">Finalizar Avaliação</button>
                    </div>
                </form>
            </div>
        `;

        viewMode.style.display = 'none';
        formMode.style.display = 'block';

        const selectCat = document.getElementById('input-categoria');
        selectCat.addEventListener('change', () => this.renderizarPerguntas(selectCat.value));
        this.renderizarPerguntas(selectCat.value); // Init

        document.getElementById('btn-cancelar-form').addEventListener('click', () => {
            formMode.style.display = 'none';
            viewMode.style.display = 'block';
        });

        document.getElementById('form-novo-feedback').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarFeedback();
        });
    },

    renderizarPerguntas(categoria) {
        const container = document.getElementById('questoes-dinamicas');
        const perguntas = QUESTIONARIO[categoria] || [];
        
        container.innerHTML = perguntas.map((p, i) => `
            <div class="form-group" style="margin-bottom: 15px;">
                <label style="font-weight: 500; color: #444;">${p}</label>
                <textarea class="form-control resposta-pergunta" data-pergunta="${p}" required rows="2" style="background: white;"></textarea>
            </div>
        `).join('');
    },

    salvarFeedback() {
        const respostas = Array.from(document.querySelectorAll('.resposta-pergunta')).map(el => {
            return `Q: ${el.dataset.pergunta}\nR: ${el.value}`;
        }).join('\n\n');

        const novoItem = {
            data: document.getElementById('input-data').value,
            categoria: document.getElementById('input-categoria').value,
            observacao: respostas, // Consolida as respostas no campo observação
            desafio: document.getElementById('input-desafio').value,
            status: 'CONCLUÍDO',
            nota: 5,
            evidenciaUrl: null
        };

        _listaAtual.unshift(novoItem);
        localStorage.setItem(`db_feedbacks_${_colabIdAtual}`, JSON.stringify(_listaAtual));
        
        // Re-renderiza a aba de feedbacks no modal
        const tabContainer = document.getElementById('tab-feedbacks');
        if (tabContainer) {
            tabContainer.innerHTML = this.render(_listaAtual, _colabIdAtual);
            this.setupEvents();
        }
    }
};