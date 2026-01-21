import { api } from '../core/api.js';

const loginForm = document.getElementById('login-form');
const msgErro = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;
    const btn = document.getElementById('login-button');

    try {
        btn.textContent = 'Autenticando...';
        btn.disabled = true;
        msgErro.textContent = '';

        const response = await api.login(cpf, senha);

        if (response.sucesso) {
            sessionStorage.setItem('accessToken', response.token);
            // Salva o objeto usuario inteiro como JSON string para usar nome/role depois
            if(response.usuario) {
                sessionStorage.setItem('usuarioNome', response.usuario.nome);
                sessionStorage.setItem('usuarioRole', response.usuario.role);
            }
            
            window.location.href = '/index.html';
        } else {
            // CORREÇÃO: api.js retorna 'erro' (pt) ou o backend retorna 'error' (en)
            // Aqui pegamos qualquer um dos dois para não falhar
            const mensagem = response.erro || response.error || 'Falha desconhecida ao entrar.';
            msgErro.textContent = mensagem;
        }
    } catch (error) {
        console.error(error);
        msgErro.textContent = 'Erro de conexão com o servidor. Aguarde alguns segundos e tente novamente.';
    } finally {
        btn.textContent = 'Entrar';
        btn.disabled = false;
    }
});
