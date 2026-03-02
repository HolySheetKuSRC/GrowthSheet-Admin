"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function SellersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/seller-applications?status=PENDING&page=0&size=10")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Seller Applications
        </h1>
        <p className="text-sm text-gray-500">
          Pending seller approval list
        </p>
      </div>

      {/* Card */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            Loading data...
          </div>
        ) : (
          <div className="bg-gray-900 text-green-400 text-sm p-6 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}