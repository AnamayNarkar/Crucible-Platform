export default function handleApiError(error: any, defaultMessage: string): never {
    if (error.response) {
        throw new Error(error.response.data?.message || defaultMessage);
    } else if (error.request) {
        throw new Error('No response from server. Please try again later.');
    } else {
        throw new Error(error.message);
    }
}