export const getBaseUrl = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    return 'http://192.168.0.118:8000';
};

export const API_BASE_URL = getBaseUrl();