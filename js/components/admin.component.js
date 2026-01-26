import { api } from '../core/api.js';

export const AdminComponent = {
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="loading">Carregando usuários...</div>';

        try {
            const response = await api.getUsuarios();
            
            if (!response.sucesso) {
                container.innerHTML = `<p class="error">Erro: ${response.error || 'Não autorizado'}</p>`;
                return;
            }

            const usuarios = response.dados;

            let html = `
                <div class="admin-panel">
                    <div class="panel-header">
                        <h2>Gestão de Usuários</h2>
                        <p>Total: ${usuarios.length} cadastrados</p>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Perfil Atual</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            usuarios.forEach(user => {
                // Não permite editar o próprio usuário para evitar se bloquear
                // (opcional, mas recomendado)
                const isMe = user.nome === sessionStorage.getItem('usuarioNome');
                
                html += `
                    <tr>
                        <td><strong>${user.nome}</strong></td>
                        <td>${user.cpf}</td>
                        <td>
                            <span class="badge badge-${user.perfil}">${user.perfil.toUpperCase()}</span>
                        </td>
                        <td>
                            <select onchange="window.alterarCargo('${user.cpf}', this.value)" ${isMe ? 'disabled' : ''} class="role-select">
                                <option value="funcionario" ${user.perfil === 'funcionario' ? 'selected' : ''}>Funcionário</option>
                                <option value="gestor" ${user.perfil === 'gestor' ? 'selected' : ''}>Gestor</option>
                                <option value="admin" ${user.perfil === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = html;

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="error">Erro ao carregar painel administrativo.</p>';
        }
    }
};

// Função Global para o onchange do Select funcionar
window.alterarCargo = async (cpf, novoPerfil) => {
    if(!confirm(`Tem certeza que deseja mudar este usuário para ${novoPerfil.toUpperCase()}?`)) {
        // Se cancelar, recarrega a página para voltar o select ao original (jeito preguiçoso mas eficaz)
        // Ou poderíamos apenas re-renderizar o componente.
        const btnNavAdmin = document.getElementById('nav-admin');
        if(btnNavAdmin) btnNavAdmin.click(); 
        return;
    }

    try {
        const res = await api.updateUserRole(cpf, novoPerfil);
        if(res.sucesso) {
            alert('Perfil atualizado com sucesso!');
            // Atualiza a cor do badge visualmente
            // Mas o ideal é recarregar a lista:
            const btnNavAdmin = document.getElementById('nav-admin');
            if(btnNavAdmin) btnNavAdmin.click(); 
        } else {
            alert('Erro: ' + (res.error || 'Falha ao atualizar'));
        }
    } catch (err) {
        alert('Erro de conexão');
    }
};