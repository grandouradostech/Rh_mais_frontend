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
    constructor() {
        // O construtor fica vazio, não colocamos métodos aqui dentro.
    }

    /**
     * Método privado genérico para realizar as requisições
     */
    async _request(endpoint, method, body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Injeta o token automaticamente se existir na sessão
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

            // Interceptador de Segurança (401/403)
            if (response.status === 401 || response.status === 403) {
                // Evita loop infinito de logout se já estivermos na tela de login
                if (!window.location.pathname.includes('login.html')) {
                    this.logout();
                }
                throw new Error('Sessão expirada ou acesso negado.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.mensagem || `Erro ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error("Erro na API:", error);
            return { sucesso: false, erro: error.message };
        }
    }

    // ========================================================
    // MÉTODOS PÚBLICOS
    // ========================================================

    get(endpoint) {
        return this._request(endpoint, 'GET');
    }

    post(endpoint, body) {
        return this._request(endpoint, 'POST', body);
    }

    put(endpoint, body) {
        return this._request(endpoint, 'PUT', body);
    }

    delete(endpoint) {
        return this._request(endpoint, 'DELETE');
    }
    getUsuarios() {
        return this._request('/auth/users', 'GET');
    }

    updateUserRole(cpfAlvo, novoPerfil) {
        return this._request('/auth/users/role', 'PUT', { cpfAlvo, novoPerfil });
    }

    // ========================================================
    // MÉTODOS DE NEGÓCIO
    // ========================================================

    login(cpf, senha) {
        return this._request('/auth/login', 'POST', { cpf, senha });
    }

    // AQUI É O LUGAR CERTO DO REGISTER 👇
    register(cpf, senha) {
        return this._request('/auth/register', 'POST', { cpf, senha });
    }

    logout() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('usuarioRole');
        sessionStorage.removeItem('usuarioNome');
        window.location.href = '/login.html';
    }
}

export const api = new ApiClient();