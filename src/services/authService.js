import axios from 'axios';

// Cambiar por la IP correcta
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las requests autenticadas
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const login = async (identifier, password) => {
  // La API acepta email o username en el campo "identifier"
  const response = await api.post('/auth/token', { identifier, password });
  return response.data; // { access_token, token_type }
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export default api;
