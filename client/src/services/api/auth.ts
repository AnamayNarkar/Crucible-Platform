import axiosInstance from "./axiosInstance";
import { handleApiError } from "./errorHandling";

export interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

interface RegistrationResponse {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

interface getMeResponse {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export async function login(emailOrUsername: string, password: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('username', emailOrUsername);
    params.append('password', password);

    try {
        const response = await axiosInstance.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error: any) {
        const result = handleApiError(error, 'Login failed');
        // If server is down, return null to prevent further processing
        if (result && 'isServerDown' in result) {
            return null;
        }
        throw error; // Re-throw if not server down
    }
}

export async function register(username: string, email: string, password: string): Promise<RegistrationResponse | null> {
    try {
        const response = await axiosInstance.post('/auth/register', {
            username,
            email,
            password
        });
        return response.data as RegistrationResponse;
    } catch (error: any) {
        const result = handleApiError(error, 'Registration failed');
        if (result && 'isServerDown' in result) {
            return null;
        }
        throw error; // Re-throw if not server down
    }
}

export async function verifySession(): Promise<any> {
    try {
        const response = await axiosInstance.get('/auth/verify-session');
        return response.data;
    }
    catch (error: any) {
        const result = handleApiError(error, 'Session verification failed');
        if (result && 'isServerDown' in result) {
            return null;
        }
        throw error;
    }
}

export async function logout(): Promise<any> {
    try {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    } catch (error: any) {
        const result = handleApiError(error, 'Logout failed');
        if (result && 'isServerDown' in result) {
            return null;
        }
        throw error;
    }
}

export async function getMe(): Promise<any> {
    try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    } catch (error: any) {
        const result = handleApiError(error, 'Failed to fetch user info');
        if (result && 'isServerDown' in result) {
            return null;
        }
        throw error;
    }
}
