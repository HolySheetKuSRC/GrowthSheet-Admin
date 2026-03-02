// lib/axios.ts
import axios from "axios";
import { tokenStorage } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

// 1. Request Interceptor: แนบ Token ไปกับทุก Request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: จัดการ Error 401 เหมือนใน React Native ของคุณ
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้าเจอ 401 และยังไม่ได้ลองขอ token ใหม่ (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        // ขอ Token ใหม่จาก Backend
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token || res.data.accessToken;
        const newRefreshToken = res.data.refresh_token || res.data.refreshToken;

        // บันทึก Token ใหม่ลงเครื่อง
        tokenStorage.setTokens(newAccessToken, newRefreshToken);

        // ยิง Request เดิมซ้ำด้วย Token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // ถ้า Refresh ไม่ผ่าน ให้ล้างข้อมูลและกลับไปหน้า Login
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