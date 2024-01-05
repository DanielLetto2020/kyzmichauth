import { ref } from 'vue';
import AuthService from './authService';
import router from "@/router/index.js";

const currentUser = ref(null);

export default function useAuth() {
    const login = async ( data ) => {
        await AuthService.login(data)
        const user = await AuthService.fetchUser();
        currentUser.value = user;
        await router.push('/')
    };

    const logout = () => {
        AuthService.logout();
        currentUser.value = null;
    };

    const register = async ( username, email, password ) => {
        await AuthService.register({ username, email, password });
        const user = await AuthService.fetchUser();
        currentUser.value = user;
    };

    return {
        currentUser,
        login,
        logout,
        register
    };
}