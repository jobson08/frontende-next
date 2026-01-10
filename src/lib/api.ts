import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[api] Enviando token:", token);
  } else {
    console.log("[api] Sem token no localStorage");
  }
  return config;
});

export default api;