import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;