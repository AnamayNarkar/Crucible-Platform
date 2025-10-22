import axiosInstance from "./axiosInstance";
import { handleApiError } from "./errorHandling";

export async function checkHealth(): Promise<any> {
    try {
        const response = await axiosInstance.get('/health')
        return response.data;
    } catch (error: any) {
        const result = handleApiError(error, 'Health check failed');
        // If server is down, return the result object
        if (result && 'isServerDown' in result) {
            return result;
        }
        // For other errors, return null
        return null;
    }
}