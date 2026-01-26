let _listaAtual = [];
let _colabIdAtual = null; // <--- O segredo: saber QUEM estamos editando

function formatarData(valor) {
    if (!valor) return '-';
    if (typeof valor === 'string' && valor.includes('-')) {
        const [ano, mes, dia] = valor.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return valor;
}

function obterDataHoje() {
    return new Date().toISOString().split('T')[0];
}

export const FeedbackComponent = {
    render(listaFeedbacksAPI, colabId) {
        _colabIdAtual = colabId; // Guarda o ID para usar no salvar depois

        const dadosLocais = localStorage.getItem(`db_feedbacks_${colabId}`);
        
        if (dadosLocais) {
            _listaAtual = JSON.parse(dadosLocais);
        } 
        else if (listaFeedbacksAPI && listaFeedbacksAPI.length > 0) {
            _listaAtual = listaFeedbacksAPI;
        } 
        else {
            _listaAtual = [];
        }

        let html = `
            <div id="feedback-view-mode">
                <div style="text-align: right; margin-bottom: 15px;">
                    <button id="btn-novo-feedback-interno" style="background: #4a69e2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight:bold;">
                        + Novo Feedback/Desafio
                    </button>
                </div>
                <div class="feedback-list">
        `;

        if (_listaAtual.length === 0) {
            html += '<div style="padding:20px; text-align:center; color:#777; background:#f9f9f9; border-radius:8px;">Nenhum feedback registrado para este colaborador.</div>';
        } else {
            _listaAtual.forEach(item => {
                let tagClass = '';
                const cat = (item.categoria || '').toUpperCase();
                if (cat === 'TECNICO') tagClass = 'tag-tecnico';
                else if (cat === 'BEMESTAR') tagClass = 'tag-bemestar';
                else tagClass = 'tag-comportamental';

                let estrelasHtml = '';
                if (item.nota !== null && item.nota !== undefined) {
                    const cheias = Math.floor(item.nota);
                    const meia = (item.nota % 1) >= 0.5;
                    for(let i=0; i<5; i++) {
                        if(i < cheias) estrelasHtml += '<span class="material-icons-outlined">star</span>';
                        else if (i === cheias && meia) estrelasHtml += '<span class="material-icons-outlined">star_half</span>';
                        else estrelasHtml += '<span class="material-icons-outlined">star_border</span>';
                    }
                    estrelasHtml += `<span style="color:#666; font-size:0.8em; margin-left:5px;">(${item.nota})</span>`;
                } else {
                    estrelasHtml = '<span style="font-size:0.9em; color:#999;">Aguardando avaliação</span>';
                }

                let acaoEvidencia = '';
                const st = (item.status || '').toUpperCase();
                if (st === 'ABERTO') {
                    acaoEvidencia = '<button class="btn-anexar" style="font-size:0.8em; cursor:pointer; padding:5px 10px;">Anexar Evidência</button>';
                } else if (item.evidenciaUrl) {
                    acaoEvidencia = `<a href="${item.evidenciaUrl}" target="_blank" style="color:#4a69e2; text-decoration:none; font-size:0.9em; font-weight:bold;">Ver Evidência 📎</a>`;
                } else {
                    acaoEvidencia = '<span style="font-size:0.8em; color:#aaa;">Sem evidência</span>';
                }

                html += `
                    <div class="feedback-card">
                        <div class="feedback-header">
                            <span class="tag-categoria ${tagClass}">${item.categoria || 'GERAL'}</span>
                            <span style="font-size:0.85em; color:#666;">${formatarData(item.data)}</span>
                        </div>
                        <div class="feedback-body">
                            <div class="feedback-section">
                                <h5>Observação</h5>
                                <div class="feedback-text">${item.observacao || '-'}</div>
                            </div>
                            <div class="feedback-section desafio-box">
                                <h5 style="color:#856404;">Desafio (Ação)</h5>
                                <div class="feedback-text" style="font-weight:500;">${item.desafio || 'Nenhuma ação definida'}</div>
                            </div>
                        </div>
                        <div class="feedback-footer">
                            <div>${acaoEvidencia}</div>
                            <div class="rating-stars">${estrelasHtml}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `   </div>
            </div>
            <div id="feedback-form-mode" style="display:none;"></div>
        `;

        return html;
    },

    setupEvents() {
        const btnNovo = document.getElementById('btn-novo-feedback-interno');
        if (btnNovo) {
            btnNovo.addEventListener('click', () => {
                this.alternarParaFormulario();
            });
        }
    },

    alternarParaFormulario() {
        const viewMode = document.getElementById('feedback-view-mode');
        const formMode = document.getElementById('feedback-form-mode');
        
        if(!viewMode || !formMode) return;

        formMode.innerHTML = `
            <div class="form-feedback">
                <h3 style="margin-top:0; color:#192A56;">Novo Registro</h3>
                <form id="form-novo-feedback">
                    <div class="form-group">
                        <label>Categoria</label>
                        <select id="input-categoria" class="form-control" required>
                            <option value="TECNICO">Técnico (Hard Skills)</option>
                            <option value="COMPORTAMENTAL">Comportamental (Soft Skills)</option>
                            <option value="BEMESTAR">Bem-estar / Saúde Mental</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="input-data" class="form-control" value="${obterDataHoje()}" required>
                    </div>

                    <div class="form-group">
                        <label>Observação (Fato/Contexto)</label>
                        <textarea id="input-obs" class="form-control" placeholder="Descreva o comportamento ou situação..." required></textarea>
                    </div>

                    <div class="form-group">
                        <label>Desafio / Ação de Melhoria</label>
                        <textarea id="input-desafio" class="form-control" placeholder="Qual a missão ou curso para evoluir?"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="btn-cancelar-form" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-salvar">Salvar Registro</button>
                    </div>
                </form>
            </div>
        `;

        viewMode.style.display = 'none';
        formMode.style.display = 'block';

        document.getElementById('btn-cancelar-form').addEventListener('click', () => {
            this.voltarParaLista();
        });

        document.getElementById('form-novo-feedback').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarFeedback();
        });
    },

    voltarParaLista() {
        const viewMode = document.getElementById('feedback-view-mode');
        const formMode = document.getElementById('feedback-form-mode');
        if(viewMode && formMode) {
            formMode.innerHTML = '';
            formMode.style.display = 'none';
            viewMode.style.display = 'block';
        }
    },

    salvarFeedback() {
        if (!_colabIdAtual) {
            alert("Erro: ID do colaborador não identificado.");
            return;
        }

        const novoItem = {
            data: document.getElementById('input-data').value,
            categoria: document.getElementById('input-categoria').value,
            observacao: document.getElementById('input-obs').value,
            desafio: document.getElementById('input-desafio').value,
            status: 'ABERTO',
            nota: null,
            evidenciaUrl: null,
            autor: 'Eu (Líder)'
        };

        _listaAtual.unshift(novoItem);

        localStorage.setItem(`db_feedbacks_${_colabIdAtual}`, JSON.stringify(_listaAtual));

        const container = document.getElementById('tab-feedbacks');
        container.innerHTML = this.render(_listaAtual, _colabIdAtual);
        this.setupEvents();
    }
};