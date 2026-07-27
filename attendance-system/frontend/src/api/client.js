import axios from "axios";

// Set VITE_API_URL in a .env file (or your host's env var settings) when deploying.
// Falls back to localhost for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ams_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("ams_token");
      localStorage.removeItem("ams_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
