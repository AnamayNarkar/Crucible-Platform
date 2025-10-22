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
        return handleApiError(error, 'Login failed');
    }
}

export async function register(username: string, email: string, password: string): Promise<RegistrationResponse> {
    try {
        const response = await axiosInstance.post('/auth/register', {
            username,
            email,
            password
        });
        return response.data as RegistrationResponse;
    } catch (error: any) {
        return handleApiError(error, 'Registration failed');
    }
}

export async function verifySession(): Promise<any> {
    try {
        const response = await axiosInstance.get('/auth/verify-session');
        return response.data;
    }
    catch (error: any) {
        return handleApiError(error, 'Session verification failed');
    }
}

export async function logout(): Promise<any> {
    try {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    } catch (error: any) {
        return handleApiError(error, 'Logout failed');
    }
}

export async function getMe(): Promise<any> {
    try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    } catch (error: any) {
        return handleApiError(error, 'Failed to fetch user info');
    }
}
