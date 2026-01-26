const DEFAULT_PROD_API_BASE_URL = 'https://rh-mais-backend.onrender.com';

function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
    const viteBaseUrl = typeof import.meta !== 'undefined' ? import.meta?.env?.VITE_API_BASE_URL : undefined;
    const windowBaseUrl = typeof window !== 'undefined' ? window?.__API_BASE_URL__ : undefined;
    const configured = windowBaseUrl || viteBaseUrl;

    if (configured) return normalizeBaseUrl(configured);

    const isLocalhost = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
    return isLocalhost ? 'http://localhost:3000' : DEFAULT_PROD_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiClient {
    constructor() {}

    async _request(endpoint, method, body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = sessionStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            // 1. Tenta ler o JSON de resposta (pode conter o erro detalhado)
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                // Se não for JSON, ignora
            }

            // 2. Interceptador de Segurança (401/403)
            if (response.status === 401 || response.status === 403) {
                // Se estivermos na tela de login, NÃO faz logout forçado, apenas avisa
                if (!window.location.pathname.includes('login.html')) {
                    this.logout();
                }
                
                // Usa a mensagem do backend se existir, senão usa a genérica
                const msgErro = data?.error || data?.mensagem || 'Sessão expirada ou acesso negado.';
                throw new Error(msgErro);
            }

            // 3. Outros erros (400, 500, etc)
            if (!response.ok) {
                throw new Error(data?.error || data?.mensagem || `Erro ${response.status}`);
            }

            return data;

        } catch (error) {
            console.error("Erro na API:", error);
            // Retorna objeto de erro para a tela tratar
            return { sucesso: false, erro: error.message };
        }
    }

    get(endpoint) { return this._request(endpoint, 'GET'); }
    post(endpoint, body) { return this._request(endpoint, 'POST', body); }
    put(endpoint, body) { return this._request(endpoint, 'PUT', body); }
    delete(endpoint) { return this._request(endpoint, 'DELETE'); }
    
    getUsuarios() { return this._request('/auth/users', 'GET'); }
    updateUserRole(cpfAlvo, novoPerfil) { return this._request('/auth/users/role', 'PUT', { cpfAlvo, novoPerfil }); }

    login(cpf, senha) { return this._request('/auth/login', 'POST', { cpf, senha }); }
    register(cpf, senha) { return this._request('/auth/register', 'POST', { cpf, senha }); }

    logout() {
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}

export const api = new ApiClient();