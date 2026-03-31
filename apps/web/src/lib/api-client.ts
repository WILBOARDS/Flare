import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach platform JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('flare_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-unwrap { data: ... } envelope
apiClient.interceptors.response.use((res) => {
  if (res.data && 'data' in res.data) return { ...res, data: res.data.data };
  return res;
});

export default apiClient;
