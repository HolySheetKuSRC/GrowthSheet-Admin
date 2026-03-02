// lib/token.ts
import Cookies from "js-cookie";

export const tokenStorage = {
  getAccessToken: () => Cookies.get("admin_token"),
  getRefreshToken: () => Cookies.get("admin_refresh_token"),

  setTokens: (accessToken: string, refreshToken?: string) => {
    // เก็บ Access Token (แนะนำให้ตั้งตามอายุจริงจาก Backend เช่น 1 วัน)
    Cookies.set("admin_token", accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // เก็บ Refresh Token (ปกติอายุ 7 วัน)
    if (refreshToken) {
      Cookies.set("admin_refresh_token", refreshToken, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
  },

  clearTokens: () => {
    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("admin_refresh_token", { path: "/" });
  },
};