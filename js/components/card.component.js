import { formatarSalario, formatarCPF, formatarData, formatarTempoDeEmpresa } from '../core/utils.js';

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
                <p><strong>PLANO DE SAÚDE:</strong> <span>EM BREVE</span></p>
                <p><strong>ENDEREÇO COMPLETO:</strong> <span></span></p>
                <p><strong>TELEFONE:</strong> <span>${v(colab.contato)}</span></p>
                <p><strong>TELEFONE DE EMERGENCIA:</strong> <span>${v(colab.telEmergencia)}</span></p>
                <p><strong>TURNO:</strong> <span>${v(colab.turno)}</span></p>
                <p><strong>LÍDER:</strong> <span>${v(colab.lider)}</span></p>
                <p><strong>DATA PROMOÇÃO:</strong> <span>${formatarData(colab.dataPromocao)}</span></p>
                <p><strong>CICLO DE GENTE:</strong> <span class="classificacao-badge ${classifClass}">${classificacaoTexto}</span></p>
            </div>
            <div class="card-footer" onclick="window.abrirDetalhesColaborador(${index})">
                <span class="material-icons-outlined expand-icon">keyboard_arrow_down</span>
            </div>
        </div>
    `;
};