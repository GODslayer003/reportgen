import axios from "axios";

const API_URL = "https://reportgen-production-757a.up.railway.app/api/auth"; // UPDATE YOUR BACKEND PORT

// REGISTER
const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// LOGIN
const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

const authService = { register, login };
export default authService;
