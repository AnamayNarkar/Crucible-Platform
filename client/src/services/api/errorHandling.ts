function handleApiError(error: any, defaultMessage: string): never {
    if (error.request && !error.response) {
        // Case 1: Request was made, but no response was received (Server is unreachable)
        // This is now the first check.
        window.location.href = '/server-down';
        throw new Error('Server is unreachable. Redirecting...');
        
    } else if (error.response) {
        // Case 2: The server responded with an error status (4xx, 5xx)
        // This includes auth errors (401, 403) which will now just throw.
        throw new Error(error.response.data?.message || defaultMessage);
        
    } else {
        // Case 3: Something else went wrong (e.g., error setting up the request)
        throw new Error(error.message);
    }
}

export { handleApiError };