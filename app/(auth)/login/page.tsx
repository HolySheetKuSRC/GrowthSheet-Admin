"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/lib/token";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { accessToken, refreshToken } = await authService.login(
        email,
        password
      );

      if (!accessToken) {
        throw new Error("Login failed");
      }

      tokenStorage.setTokens(accessToken, refreshToken);

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 text-gray-900">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold mb-2">
          ยินดีต้อนรับกลับมา
        </h2>
        <p className="text-gray-500">
          เข้าสู่ระบบเพื่อจัดการ GrowthSheet Admin
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* EMAIL */}
        <div>
          <label className="block text-sm font-semibold mb-2 ml-1">
            อีเมลผู้ใช้
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-black transition-colors">
              <Mail className="w-5 h-5" />
            </div>

            <input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:ring-2 focus:ring-black
              focus:border-transparent
              outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-semibold mb-2 ml-1">
            รหัสผ่าน
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-black transition-colors">
              <Lock className="w-5 h-5" />
            </div>

            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:ring-2 focus:ring-black
              focus:border-transparent
              outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-lg
          transition-all duration-200 flex items-center justify-center space-x-2
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900 active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังยืนยันตัวตน...</span>
            </>
          ) : (
            <span>เข้าสู่ระบบ</span>
          )}
        </button>
      </form>

      {/* FOOTER */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          © 2026 GrowthSheet Management System
        </p>
      </div>
    </div>
  );
}