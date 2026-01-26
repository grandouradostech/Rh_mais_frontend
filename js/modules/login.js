import { api } from '../core/api.js';

// Elementos Login
const formLogin = document.getElementById('login-form');
const msgErroLogin = document.getElementById('error-message-login');

// Elementos Cadastro
const formRegister = document.getElementById('register-form');
const msgErroRegister = document.getElementById('error-message-register');
const divSuccess = document.getElementById('register-success');

// Links de Navegação
const linkIrCadastro = document.getElementById('link-ir-cadastro');
const linkIrLogin = document.getElementById('link-ir-login');
const btnVoltarLogin = document.getElementById('btn-voltar-login');
const titulo = document.getElementById('form-title');
const subtitulo = document.getElementById('form-subtitle');

// === LÓGICA DE ALTERNAR TELAS ===
function mostrarLogin() {
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    divSuccess.style.display = 'none';
    titulo.textContent = 'RH MAIS';
    subtitulo.textContent = 'Acesso ao Sistema de Gestão';
    msgErroLogin.textContent = '';
}

function mostrarCadastro() {
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    divSuccess.style.display = 'none';
    titulo.textContent = 'Novo Cadastro';
    subtitulo.textContent = 'Validação via CPF';
    msgErroRegister.textContent = '';
}

linkIrCadastro.addEventListener('click', (e) => { e.preventDefault(); mostrarCadastro(); });
linkIrLogin.addEventListener('click', (e) => { e.preventDefault(); mostrarLogin(); });
btnVoltarLogin.addEventListener('click', (e) => { e.preventDefault(); mostrarLogin(); });

// === LÓGICA DE LOGIN (Mantida) ===
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cpf = document.getElementById('cpf-login').value;
    const senha = document.getElementById('senha-login').value;
    const btn = document.getElementById('login-button');

    try {
        btn.textContent = 'Autenticando...';
        btn.disabled = true;
        msgErroLogin.textContent = '';

        const response = await api.login(cpf, senha);

        if (response.sucesso) {
            sessionStorage.setItem('accessToken', response.token);
            if(response.usuario) {
                sessionStorage.setItem('usuarioNome', response.usuario.nome);
                sessionStorage.setItem('usuarioRole', response.usuario.role);
            }
            window.location.href = '/index.html';
        } else {
            msgErroLogin.textContent = response.erro || 'Falha ao entrar.';
        }
    } catch (error) {
        msgErroLogin.textContent = 'Erro de conexão. Tente novamente.';
    } finally {
        btn.textContent = 'Entrar';
        btn.disabled = false;
    }
});

// === LÓGICA DE CADASTRO (Nova) ===
formRegister.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cpf = document.getElementById('cpf-register').value;
    const senha = document.getElementById('senha-register').value;
    const btn = document.getElementById('register-button');

    try {
        btn.textContent = 'Validando...';
        btn.disabled = true;
        msgErroRegister.textContent = '';

        const response = await api.register(cpf, senha);

        if (response.sucesso) {
            // Sucesso! Mostra tela de confirmação
            formRegister.style.display = 'none';
            divSuccess.style.display = 'block';
            titulo.textContent = 'Sucesso';
            subtitulo.textContent = 'Bem-vindo ao time!';
        } else {
            msgErroRegister.textContent = response.erro || response.error || 'Erro ao cadastrar.';
        }
    } catch (error) {
        console.error(error);
        msgErroRegister.textContent = 'Erro ao conectar com o servidor.';
    } finally {
        btn.textContent = 'Criar Conta';
        btn.disabled = false;
    }
});