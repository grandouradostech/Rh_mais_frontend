// js/core/utils.js

export function formatarSalario(valor) {
    if (!valor) return '';
    let numero = valor;
    if (typeof valor === 'string') {
        numero = parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    }
    if (isNaN(numero)) return valor;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
}

export function formatarCPF(cpf) {
    if (!cpf) return '';
    let c = String(cpf).replace(/\D/g, '').padStart(11, '0');
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
}

export function formatarData(valor) {
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

export function formatarTempoDeEmpresa(dias) {
    if (!dias) return 'Recente';
    const n = parseInt(dias, 10);
    if (isNaN(n)) return dias;
    if (n < 30) return "Menos de 1 mês";
    if (n < 365) return `${Math.floor(n/30)} meses`;
    return `${Math.floor(n/365)} anos`;
}

export function obterDataHoje() {
    return new Date().toISOString().split('T')[0];
}