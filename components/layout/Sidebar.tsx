"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("admin_token", { path: "/" });
    Cookies.remove("admin_refresh_token", { path: "/" });
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Sellers", href: "/sellers" },
    { name: "Sheets", href: "/sheets" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 px-2 text-black">GrowthSheet</div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href 
                ? "bg-black text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}