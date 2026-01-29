import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[api] Enviando Authorization: Bearer", token);
  }
  console.log("Requisição iniciada:", config.method?.toUpperCase(), config.url);
  console.log("Headers:", config.headers);
  console.log("Dados enviados:", config.data);
  return config;
});
/*
api.interceptors.response.use(
  (response) => {
    console.log("Resposta recebida:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("Erro na resposta:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
*/

export default api;