import axios from 'axios';

// Get backend URL from environment variables, fallback to localhost for dev
const API_BASE_URL = 'https://my-ecommerce-app-s4qu.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let accessToken = '';

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                // Use API_BASE_URL here instead of hardcoded localhost
                const res = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;
                setAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken('');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;