"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <div>{children}</div>;
}