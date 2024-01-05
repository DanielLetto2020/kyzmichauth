import axios from 'axios';

class AuthService {
    constructor( options ) {
        this.apiUrl = options.apiUrl;
        this.endpoints = options.endpoints;
        this.keysData = options.keysData
    }

    login( user ) {
        const { url, method } = this.endpoints.login;
        return axios[method](url, { ...user })
            .then(resp => {
                const keys = this.keysData.data.token.split('.');
                const token = keys.reduce(( acc, key ) => acc[key], resp.data);
                if (token) {
                    localStorage.setItem(this.keysData.storage.token, JSON.stringify(token));
                }
                return token;
            }).catch(e => {
                console.log(e.message)
            });
    }

    register( user ) {
        const { url, method } = this.endpoints.register;
        return axios[method](url, { ...user })
            .then(resp => {
                const keys = this.keysData.data.token.split('.');
                const token = keys.reduce(( acc, key ) => acc[key], resp.data);
                if (token) {
                    localStorage.setItem(this.keysData.storage.token, JSON.stringify(token));
                }
                return resp.data;
            }).catch(e => {
                console.log(e.message)
            });
    }

    logout() {
        const { url, method } = this.endpoints.logout;
        return axios[method](url).then(( resp ) => {
            if (resp.statusCode === 200) {
                localStorage.removeItem(this.keysData.storage.user);
                localStorage.removeItem(this.keysData.storage.token);
            }
        });
    }

    fetchUser() {
        const { url, method } = this.endpoints.user;
        return axios[method](url).then(resp => {
            const keys = this.keysData.data.user.split('.');
            const user = keys.reduce(( acc, key ) => acc[key], resp.data);
            localStorage.setItem(this.keysData.storage.user, JSON.stringify(user));
            return user
        });
    }
}

const options = {
    apiUrl: import.meta.env.VITE_API_URL, // import.meta.env.VITE_API_URL
    endpoints: {
        login: { url: '/login', method: 'post' },
        logout: { url: '/logout', method: 'post' },
        register: { url: '/register', method: 'post' },
        user: { url: '/user', method: 'get' },
    },
    keysData: {
        data: {
            user: 'data',
            token: 'token'
        },
        storage: {
            user: 'auth_user',
            token: 'auth_token'
        }
    },
};

const authService = new AuthService(options);

axios.defaults.baseURL = authService.apiUrl
axios.interceptors.request.use(
    config => {
        // Получаем значение ключа хранения токена из authService
        const storageTokenKey = authService.keysData.storage.token;

        // Получаем токен из localStorage
        const token = JSON.parse(localStorage.getItem(storageTokenKey));

        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
    },
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem(authService.keysData.storage.user);
            localStorage.removeItem(authService.keysData.storage.token);
        }
        return Promise.reject(error);
    }
);

export default authService;