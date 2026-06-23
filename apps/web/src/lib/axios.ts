import axios, { type AxiosRequestConfig } from 'axios';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

interface RetriableRequest extends AxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const performRefresh = async (): Promise<void> => {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').then(
            () => {
                refreshPromise = null;
            },
            (e) => {
                refreshPromise = null;
                throw e;
            }
        );
    }
    return refreshPromise;
};

api.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);

        const original = error.config as RetriableRequest | undefined;
        const status = error.response?.status;
        const url = original?.url ?? '';

        if (status !== 401 || !original || original._retry || SKIP_REFRESH_PATHS.some((p) => url.includes(p))) {
            return Promise.reject(error);
        }

        original._retry = true;
        try {
            await performRefresh();
            return api.request(original);
        } catch (refreshErr) {
            return Promise.reject(refreshErr);
        }
    }
);
