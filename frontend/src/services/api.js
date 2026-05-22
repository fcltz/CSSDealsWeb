import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use((config) => {
  try {
    const storageStr = localStorage.getItem('cssdeals-storage');
    if (storageStr) {
      const storageObj = JSON.parse(storageStr);
      const token = storageObj?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Erro ao ler token do localStorage:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
