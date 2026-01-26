import { FeedbackComponent } from './feedback.component.js';

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function formatarSalario(valor) {
    if (!valor) return '';
    let numero = valor;
    if (typeof valor === 'string') {
        numero = parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    }
    if (isNaN(numero)) return valor;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
}

function formatarCPF(cpf) {
    if (!cpf) return '';
    let c = String(cpf).replace(/\D/g, '').padStart(11, '0');
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
}

function formatarData(valor) {
    if (!valor) return '-';
    // Tratamento para ISO Date (yyyy-mm-dd)
    if (typeof valor === 'string' && valor.includes('-')) {
        const [ano, mes, dia] = valor.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }
    // Tratamento para Serial Date (Excel)
    const serial = Number(valor);
    if (!isNaN(serial) && serial > 20000) {
        const d = new Date((serial - 25569) * 86400000);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString('pt-BR');
    }
    return valor;
}

function formatarTempoDeEmpresa(dias) {
    if (!dias) return 'Recente';
    const n = parseInt(dias, 10);
    if (isNaN(n)) return dias;
    if (n < 30) return "Menos de 1 mês";
    if (n < 365) return `${Math.floor(n/30)} meses`;
    return `${Math.floor(n/365)} anos`;
}

// Placeholder para Upload (Mantido da versão original)
window.handleFileSelect = function(input, cpf) {
    alert("Upload em desenvolvimento para: " + cpf);
};

// ==========================================
// FUNÇÃO GLOBAL DE TROCA DE ABAS
// ==========================================
window.trocarAba = function(event, tabId) {
    // Remove active de todos os botões e conteúdos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa o botão clicado e o conteúdo alvo
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
};

// ==========================================
// COMPONENTE DO MODAL
// ==========================================
export const ModalComponent = {
    abrir(colab) {
        const modal = document.getElementById('modal-detalhes');
        const content = document.getElementById('modal-conteudo-dinamico');
        
        if (!modal || !content) return;

        const v = (val) => val || '';
        const nome = colab.nome || 'Colaborador';
        const fotoSrc = colab.foto || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
        const tempoEmpresa = formatarTempoDeEmpresa(colab.tempoEmpresa);

        // GERAÇÃO DO HTML
        content.innerHTML = `
            <div id="modal-header-custom" style="display: flex; align-items: center; gap: 20px; background-color: #192A56; color: white; padding: 25px 30px; margin: -30px -30px 20px -30px; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div class="avatar-upload-wrapper" style="position:relative; width:90px; height:90px;">
                    <img src="${fotoSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
                    
                    <div class="camera-badge" onclick="document.getElementById('file-input-${colab.id}').click()" 
                         style="position:absolute; bottom:0; right:0; background:#fff; color:#192A56; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #192A56;">
                        <span class="material-icons-outlined" style="font-size:18px;">photo_camera</span>
                    </div>
                    <input type="file" id="file-input-${colab.id}" accept="image/*" style="display: none;" onchange="handleFileSelect(this, '${colab.cpf}')">
                </div>
                
                <div>
                    <h2 style="margin:0; font-size:1.6em; color:#fff; font-weight:700;">${nome}</h2>
                    <div style="margin-top:8px; opacity: 0.9;">
                        ${v(colab.cargo)} | ${v(colab.area)}
                    </div>
                </div>
            </div>

            <div class="tabs-header">
                <button class="tab-btn active" onclick="window.trocarAba(event, 'tab-perfil')">Perfil</button>
                <button class="tab-btn" onclick="window.trocarAba(event, 'tab-ciclo')">Ciclo de Gente</button>
                <button class="tab-btn" onclick="window.trocarAba(event, 'tab-feedbacks')">Feedbacks & Desafios</button>
            </div>

            <div id="tab-perfil" class="tab-content active">
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; color:#856404;">Rating de Potencial (9-Box)</label>
                    <select style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="BOM" ${colab.classificacao === 'BOM' ? 'selected' : ''}>Bom</option>
                        <option value="MUITO BOM" ${colab.classificacao === 'MUITO BOM' ? 'selected' : ''}>Muito Bom</option>
                        <option value="PREPARAR" ${colab.classificacao === 'PREPARAR' ? 'selected' : ''}>Preparar (Promoção)</option>
                        <option value="RECUPERAR" ${colab.classificacao === 'RECUPERAR' ? 'selected' : ''}>Recuperar (PIP)</option>
                        <option value="DESLIGAR" ${colab.classificacao === 'DESLIGAR' ? 'selected' : ''}>Desligar</option>
                    </select>
                </div>

                <div class="modal-dados-grid">
                    <div class="modal-item"><strong>Admissão</strong> <span>${formatarData(colab.dataAdmissao)}</span></div>
                    <div class="modal-item"><strong>Tempo de Casa</strong> <span>${tempoEmpresa}</span></div>
                    <div class="modal-item"><strong>Salário</strong> <span>${formatarSalario(colab.salario)}</span></div>
                    <div class="modal-item"><strong>Escolaridade</strong> <span>${v(colab.escolaridade)}</span></div>
                    <div class="modal-item"><strong>PCD</strong> <span>${colab.pcd ? 'SIM' : 'NÃO'}</span></div>
                    <div class="modal-item"><strong>Líder</strong> <span>${v(colab.lider)}</span></div>
                    <div class="modal-item"><strong>Turno</strong> <span>${v(colab.turno)}</span></div>
                </div>
            </div>

            <div id="tab-ciclo" class="tab-content">
                ${gerarHtmlPDI(colab)}
            </div>

            <div id="tab-feedbacks" class="tab-content">
                ${FeedbackComponent.render(colab.feedbacks, colab.id)}
            </div>
        `;

        // Ativa os eventos (clique dos botões) da aba de feedback
        FeedbackComponent.setupEvents();

        modal.style.display = 'flex';
    },

    fechar() {
        const modal = document.getElementById('modal-detalhes');
        if (modal) modal.style.display = 'none';
    }
};

// ==========================================
// GERADOR DE HTML DO PDI (CICLO)
// ==========================================
function gerarHtmlPDI(colab) {
    let html = `
        <div class="pdi-section">
            <h3 style="color:#192A56;">Metas Anuais (Ciclo)</h3>
            <div class="pdi-container">
    `;

    const listaPDI = colab.cicloGente || [];
    let encontrou = false;

    if (listaPDI.length > 0) {
        listaPDI.forEach((item, index) => {
            encontrou = true;
            html += `
                <div class="pdi-card" data-status="${(item.status || '').toUpperCase()}">
                    <h4>${index + 1}. ${item.competencia || 'Competência'}</h4>
                    <div class="pdi-details">
                        <div class="pdi-item"><strong>Situação Atual</strong> <span>${item.situacaoAcao || '-'}</span></div>
                        <div class="pdi-item"><strong>Ação (O que fazer)</strong> <span>${item.acao || '-'}</span></div>
                        <div class="pdi-item"><strong>Motivo (Por que)</strong> <span>${item.motivo || '-'}</span></div>
                        <div class="pdi-item"><strong>Apoio (Quem ajuda)</strong> <span>${item.ajuda || '-'}</span></div>
                        <div class="pdi-item"><strong>Como vou fazer</strong> <span>${item.como || '-'}</span></div>
                        <div class="pdi-item"><strong>Prazo</strong> <span>${formatarData(item.prazo)}</span></div>
                        <div class="pdi-item"><strong>Status</strong> <span>${item.status || 'PENDENTE'}</span></div>
                    </div>
                </div>
            `;
        });
    }

    if (!encontrou) html += `<p style="padding:10px; color:#777;">Nenhum plano de ação anual cadastrado.</p>`;
    html += `</div></div>`;
    return html;
}