// Configuração da URL do Backend
const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
    constructor() {
        // Não precisamos guardar nada no construtor por enquanto
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
            // Removemos '/api' da base se o endpoint já vier completo, 
            // mas como padronizamos, vamos concatenar direto.
            // Se o endpoint começar com /, ele junta com a base.
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

            // Interceptador de Segurança (401/403)
            if (response.status === 401 || response.status === 403) {
                this.logout();
                throw new Error('Sessão expirada ou acesso negado.');
            }

            // Tenta ler o JSON
            const data = await response.json();

            // Se o status HTTP não for 200-299, lança erro
            if (!response.ok) {
                throw new Error(data.error || data.mensagem || `Erro ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error("Erro na API:", error);
            // Retorna um objeto de erro para o frontend tratar sem quebrar a tela
            return { sucesso: false, erro: error.message };
        }
    }

    // ========================================================
    // MÉTODOS PÚBLICOS (Aqui está o que faltava: .get, .post)
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

    // ========================================================
    // MÉTODOS ESPECÍFICOS DE NEGÓCIO
    // ========================================================

    login(cpf, senha) {
        // Ajuste a rota '/auth/login' conforme definimos no backend
        return this._request('/auth/login', 'POST', { cpf, senha });
    }

    logout() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('usuarioRole');
        sessionStorage.removeItem('usuarioNome');
        window.location.href = 'login.html';
    }
}

export const api = new ApiClient();