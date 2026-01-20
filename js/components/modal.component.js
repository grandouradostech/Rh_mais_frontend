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
    if (typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [ano, mes, dia] = valor.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }
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

// Placeholder para Upload
window.handleFileSelect = function(input, cpf) {
    alert("Upload em desenvolvimento para: " + cpf);
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
        const nome = colab.nome || '';
        const status = colab.situacao || '';
        const fotoSrc = colab.foto || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
        const tempoEmpresa = formatarTempoDeEmpresa(colab.tempoEmpresa);
        let classificacao = colab.classificacao || 'NOVO';
        if (classificacao === 'SEM') classificacao = 'NOVO';

        // 1. HEADER COM A COR #192A56
        // Usamos margin negativa (-30px) para ignorar o padding do modal e encostar nas bordas
        content.innerHTML = `
            <div id="modal-header-custom" style="
                display: flex; 
                align-items: center; 
                gap: 20px; 
                background-color: #192A56; 
                color: white; 
                padding: 25px 30px; 
                margin: -30px -30px 25px -30px; 
                border-radius: 12px 12px 0 0;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            ">
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
                    <div style="margin-top:8px;">
                        <span style="background-color:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:#fff; padding:4px 12px; border-radius:20px; font-size:0.85em; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">
                            ${status}
                        </span>
                    </div>
                </div>
            </div>

            <div class="modal-dados-grid">
                <div class="modal-item"><strong>Tempo de Casa</strong> <span>${tempoEmpresa}</span></div>
                <div class="modal-item"><strong>Escolaridade</strong> <span>${v(colab.escolaridade)}</span></div>
                <div class="modal-item"><strong>PCD</strong> <span>${colab.pcd ? 'SIM' : 'NÃO'}</span></div>
                <div class="modal-item"><strong>Líder</strong> <span>${v(colab.lider)}</span></div>
                <div class="modal-item"><strong>Turno</strong> <span>${v(colab.turno)}</span></div>
                <div class="modal-item"><strong>CLASSIFICAÇÃO CICLO</strong> <span>${classificacao}</span></div>
                <div class="modal-item"><strong>DATA PROMOÇÃO</strong> <span>${formatarData(colab.dataPromocao)}</span></div>
            </div>
            
            ${gerarHtmlPDI(colab)}
        `;

        modal.style.display = 'flex';
    },

    fechar() {
        const modal = document.getElementById('modal-detalhes');
        if (modal) modal.style.display = 'none';
    }
};

// ==========================================
// GERAR PDI (Scroll Horizontal)
// ==========================================
function gerarHtmlPDI(colab) {
    let html = `
        <div class="pdi-section">
            <h3 style="color:#192A56;">Ciclo de Gente - Plano de Desenvolvimento</h3>
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

    if (!encontrou) html += `<p style="padding:10px; color:#777;">Nenhum plano de ação cadastrado.</p>`;
    html += `</div></div>`;
    return html;
}