import axios from 'axios';

const API = axios.create({
  baseURL: 'http://103.134.154.55:5001',
  // baseURL: 'http://localhost:5000',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
