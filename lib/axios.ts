import axios from "axios";
import { tokenStorage } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://165.22.247.245:8080",
});

// 1. Request Interceptor: แนบ Access Token และ X-USER-ID
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  const adminId = tokenStorage.getAdminId?.(); // ดึงจากคุกกี้ที่เก็บไว้ตอน Login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // แนบ Admin ID ไปใน Header เสมอตามที่ Backend ต้องการ
  if (adminId) {
    config.headers["X-USER-ID"] = adminId;
  }

  return config;
});

// 2. Response Interceptor: จัดการ Error 401 (Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        // ขอ Token ใหม่
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token || res.data.accessToken;
        const newRefreshToken = res.data.refresh_token || res.data.refreshToken;

        // บันทึก Token ใหม่
        tokenStorage.setTokens(newAccessToken, newRefreshToken);

        // ยิง Request เดิมซ้ำ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;