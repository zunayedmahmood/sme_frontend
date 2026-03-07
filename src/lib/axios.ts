import axios from 'axios';

const api = axios.create({
    baseURL: 'http://sarengmedequip.up.railway.app/api', // Default Laravel Artisan serve port
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add the bearer token from localStorage
api.interceptors.request.use(
    (config) => {
        // Only add token if it exists in local storage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
