import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (
      envUrl &&
      !envUrl.includes('localhost') &&
      !envUrl.includes('127.0.0.1')
    ) {
      return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
    }
    return 'https://api-sulflux.dorneles.dev/api';
  }
  const fallback = envUrl || 'http://localhost:5001';
  return fallback.endsWith('/api')
    ? fallback
    : `${fallback.replace(/\/+$/, '')}/api`;
};

const baseURL = getBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
