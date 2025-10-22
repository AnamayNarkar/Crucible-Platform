import { type NavigateFunction } from 'react-router-dom';

let navigator: NavigateFunction | undefined; // Stores the function returned by useNavigate()

// 1. Function to set the navigator externally
export const setNavigator = (navFn: NavigateFunction) => {
    navigator = navFn;
};

// 2. Function that the services/handlers will call
export const navigate = (path: string) => {
    if (navigator) {
        navigator(path);
    } else {
        // Handle case where navigator hasn't been set (e.g., initial load)
        console.warn('Navigation function not yet set.');
    }
};