// services/authService.ts
import api from "@/lib/axios";

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/admin-login", { email, password });
    return {
      accessToken: res.data.access_token || res.data.accessToken,
      refreshToken: res.data.refresh_token || res.data.refreshToken,
    };
  },
  
  logout: async (refreshToken: string) => {
    return api.post("/auth/logout", { refresh_token: refreshToken });
  }
};