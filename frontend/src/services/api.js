import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Em produção, usar variavel de ambiente
  timeout: 10000,
});

export default api;
