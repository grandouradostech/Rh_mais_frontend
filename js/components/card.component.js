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
    if (!valor) return '';
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

export const createEmployeeCard = (colab, index) => {
    const v = (val) => val || ''; 
    const fotoSrc = colab.foto || 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

    let statusClass = 'status-ativo';
    const st = (colab.situacao || '').toUpperCase();
    if (st.includes('AFASTADO')) statusClass = 'status-afastado';
    if (st.includes('DESLIGADO')) statusClass = 'status-desligados';

    const pcdValor = (colab.pcd === true || colab.pcd === 'SIM') ? 'SIM' : 'NÃO';
    const pcdClass = (pcdValor === 'SIM') ? 'pcd-sim' : 'pcd-nao';

    let classifClass = 'classificacao-sem';
    const classif = (colab.classificacao || '').toUpperCase();
    if (classif === 'BOM') classifClass = 'classificacao-bom';
    else if (classif === 'MUITO BOM') classifClass = 'classificacao-muito-bom';
    else if (classif === 'RECUPERAR') classifClass = 'classificacao-recuperar';
    else if (classif === 'DESLIGAR') classifClass = 'classificacao-desligar';
    else if (classif === 'PREPARAR') classifClass = 'classificacao-preparar';
    
    let classificacaoTexto = colab.classificacao || 'NOVO';
    if (classificacaoTexto === 'SEM') classificacaoTexto = 'NOVO';

    return `
        <div class="employee-card ${statusClass}">
            <div class="card-header">
                <img src="${fotoSrc}" alt="Foto">
                <div class="header-info">
                    <h3>${v(colab.nome)}</h3>
                    <span class="status-badge ${statusClass}">${st}</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>NOME:</strong> <span>${v(colab.nome)}</span></p>
                <p><strong>CPF:</strong> <span>${formatarCPF(colab.cpf)}</span></p>
                <p><strong>FUNÇÃO ATUAL:</strong> <span>${v(colab.cargo)}</span></p>
                <p><strong>AREA:</strong> <span>${v(colab.area)}</span></p>
                <p><strong>TEMPO DE EMPRESA:</strong> <span>${formatarTempoDeEmpresa(colab.tempoEmpresa)}</span></p>
                <p><strong>ESCOLARIDADE:</strong> <span>${v(colab.escolaridade)}</span></p>
                <p><strong>SALARIO:</strong> <span>${formatarSalario(colab.salario)}</span></p>
                <p><strong>PCD:</strong> <span class="pcd-badge ${pcdClass}">${pcdValor}</span></p>
                <p><strong>PLANO DE SAÚDE:</strong> <span></span></p>
                <p><strong>ENDEREÇO COMPLETO:</strong> <span></span></p>
                <p><strong>TELEFONE DO COLABORADOR:</strong> <span>${v(colab.contato)}</span></p>
                <p><strong>TELEFONE DE EMERGENCIA:</strong> <span>${v(colab.contatoEmergencia)}</span></p>
                <p><strong>TURNO:</strong> <span>${v(colab.turno)}</span></p>
                <p><strong>LÍDER IMEDIATO:</strong> <span>${v(colab.lider)}</span></p>
                <p><strong>ULTIMA FUNÇÃO:</strong> <span>${v(colab.cargoAntigo)}</span></p>
                <p><strong>DATA ULTIMA PROMOÇÃO:</strong> <span>${formatarData(colab.dataPromocao)}</span></p>
                <p><strong>CICLO DE GENTE:</strong> <span class="classificacao-badge ${classifClass}">${classificacaoTexto}</span></p>
            </div>
            <div class="card-footer" onclick="window.abrirDetalhesColaborador(${index})">
                <span class="material-icons-outlined expand-icon">keyboard_arrow_down</span>
            </div>
        </div>
    `;
};