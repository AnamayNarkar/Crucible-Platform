import { navigate } from "../navigationService";

export interface ApiErrorResult {
    isServerDown: boolean;
    error?: Error;
}

function handleApiError(error: any, defaultMessage: string): never | ApiErrorResult {
    if (error.request && !error.response) {
        // Case 1: Request was made, but no response was received (Server is unreachable)
        // This is the correct check for network errors, timeouts, or a down server.
        console.error("Network error or server is down:", error.message);
        navigate("/server-down");
        // Return a special object to indicate server is down
        // This allows calling code to handle it without throwing
        return { isServerDown: true };
    } else if (error.response) {
        // Case 2: The server responded with an error status (4xx, 5xx)
        // We get the message from the server's response body.
        const errorMessage = error.response.data?.message || error.response.data?.error || defaultMessage;
        throw new Error(errorMessage);
        
    } else {
        // Case 3: Something else went wrong (e.g., error setting up the request)
        // This catches errors where `error.request` was never even created.
        throw new Error(error.message || "An unexpected error occurred.");
    }
}

export { handleApiError };