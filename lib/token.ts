// lib/token.ts ปรับปรุงใหม่
import Cookies from "js-cookie";

export const tokenStorage = {
  getAccessToken: () => Cookies.get("admin_token"),
  getRefreshToken: () => Cookies.get("admin_refresh_token"),
  getAdminId: () => Cookies.get("admin_id"), // เพิ่มการดึง Admin ID

  setTokens: (accessToken: string, refreshToken?: string, adminId?: string) => {
    Cookies.set("admin_token", accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (refreshToken) {
      Cookies.set("admin_refresh_token", refreshToken, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    // เก็บ Admin ID ไว้ใช้แนบ Header X-USER-ID
    if (adminId) {
      Cookies.set("admin_id", adminId, { path: "/" });
    }
  },

  clearTokens: () => {
    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("admin_refresh_token", { path: "/" });
    Cookies.remove("admin_id", { path: "/" });
  },
};