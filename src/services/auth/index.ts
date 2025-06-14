import api from "../axiosInstance";
import { ENDPOINTS } from "../network/endpoints";
import { Token, User } from "../../types/interfaces";

const AuthService = {
  async login(email: string, password: string): Promise<{ token: Token; user: User }> {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await api.post(ENDPOINTS.LOGIN, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    console.log("Login into app", JSON.stringify(response.data));
    return response.data;
  },

  async register(data: { email: string; full_name?: string; phone?: string; password: string; role?: string }): Promise<User> {
    const response = await api.post(ENDPOINTS.REGISTER, data);
    return response.data;
  }
};

export default AuthService;
