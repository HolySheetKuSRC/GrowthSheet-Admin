"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [topSheets, setTopSheets] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [pending, setPending] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]); // สร้าง State เก็บ Revenue Data แทน

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [
        summaryRes,
        sellersRes,
        sheetsRes,
        activityRes,
        pendingRes,
        revenueRes, // เพิ่ม Response สำหรับ API รายได้
      ] = await Promise.all([
        api.get("/admin/dashboard/summary"),
        api.get("/admin/dashboard/top-sellers"),
        api.get("/admin/dashboard/top-sheets"),
        api.get("/admin/dashboard/recent-activity"),
        api.get("/admin/dashboard/pending-actions"),
        // ดึงข้อมูลยอดขายย้อนหลัง 7 วันจาก API ที่มีอยู่แล้วใน admin-service !!
        api.get("/admin/dashboard/revenue?range=7d"),
      ]);

      setSummary(summaryRes.data || {});
      setTopSellers(Array.isArray(sellersRes.data) ? sellersRes.data : []);
      setTopSheets(Array.isArray(sheetsRes.data) ? sheetsRes.data : []);
      setActivities(Array.isArray(activityRes.data) ? activityRes.data : []);
      setPending(pendingRes.data || {});

      // นำข้อมูลยอดขายมาแปลงให้เป็นรูปแบบที่กราฟแสดงได้ (เติมเต็ม 0 วันหยุดที่ไม่มีรายได้)
      const revenueArray = revenueRes.data?.data;
      if (Array.isArray(revenueArray)) {
        // สร้างอาร์เรย์เตรียมไว้สำหรับเจ็ดวันล่าสุด
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i)); // -6 จนถึงวันนี้ 
          return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
        });

        const revenueMap = new Map();
        revenueArray.forEach((item: any) => {
          revenueMap.set(item.date, item.revenue); // จับคู่วันที่กับจำนวนเงินที่ส่งมาจาก backend
        });

        // แมพข้อมูลทั้งเจ็ดวันและแปลงให้อยู่ในชื่อวันแบบสั้น (Mon, Tue ...)
        const formattedRevenue = last7Days.map((dateStr) => {
          const d = new Date(dateStr);
          return {
            name: d.toLocaleDateString("en-US", { weekday: "short" }),
            revenue: revenueMap.get(dateStr) || 0, // หากไม่มี record ในวันนั้น ๆ ให้เป็น 0 (กันวันที่ยอดขายเป็น 0 และ backend ไม่พ่นกลับมา)
          };
        });

        setRevenueData(formattedRevenue);
      }

    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-emerald-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        Loading dashboard...
      </div>
    );
  }
  console.log("เช็คค่า Pending:", pending);

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen p-6 rounded-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">ภาพรวมของระบบ GrowthSheet</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card title="Users" value={summary?.totalUsers} icon="👥" color="text-indigo-600" />
        <Card title="Sellers" value={summary?.totalSellers} icon="🏪" color="text-indigo-600" />
        <Card title="Sheets" value={summary?.totalSheets} icon="📄" color="text-emerald-600" />
        <Card title="Revenue" value={`$${summary?.totalRevenue || 0}`} icon="💰" color="text-emerald-600" />
        <Card title="Pending Reports" value={summary?.pendingReports} icon="⚠️" color="text-rose-500" />
        <Card title="Withdraws" value={summary?.pendingWithdrawals} icon="🏦" color="text-amber-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Revenue */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-lg text-slate-800 mb-6">Revenue Overview (7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {/* ส่งข้อมูล revenueData จาก Backend เข้าไปแสดงผล */}
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Top Sheets */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-lg text-slate-800 mb-6">Top Selling Sheets</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSheets.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-lg text-slate-800 mb-4">Pending Actions</h2>
        {/* ปรับเป็น 4 columns เพื่อให้พอดีกับ 4 การ์ด */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Seller Applications"
            value={pending?.sellerApplications}
            link="/sellers"
            alert={pending?.sellerApplications > 0}
          />
          {/* เพิ่มส่วนของ Sheets ตรงนี้ */}
          <ActionCard
            title="Sheets"
            value={pending?.sheets}
            link="/sheets"
            alert={pending?.sheets > 0}
          />
          <ActionCard
            title="Withdraw Requests"
            value={pending?.withdrawRequests}
            link="/withdraw"
            alert={pending?.withdrawRequests > 0}
          />  
          <ActionCard
            title="Reports"
            value={pending?.reports}
            link="/reports"
            alert={pending?.reports > 0}
          />
        </div>
      </div>

      {/* Tables & Activity */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Top Sellers Table */}
        <div className="xl:col-span-2">
          <TableCard title="Top Sellers">
            {topSellers.map((s) => (
              <tr key={s.sellerId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-700">{s.sellerName}</td>
                <td className="px-6 py-3 text-slate-500">{s.sales} sales</td>
                <td className="px-6 py-3 text-emerald-600 font-semibold text-right">${s.revenue}</td>
              </tr>
            ))}
          </TableCard>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-lg text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((a, i) => (
                <div key={i} className="flex flex-col border-b border-slate-50 pb-3 last:border-0 text-sm">
                  <span className="text-slate-700">{a.message}</span>
                  <span className="text-slate-400 text-xs mt-1">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-sm text-center py-4">No recent activities</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */
function Card({ title, value, icon, color }: any) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
        <div className={`text-2xl font-bold mt-1 ${color}`}>{value || 0}</div>
      </div>
    </div>
  );
}

function ActionCard({ title, value, link, alert }: any) {
  return (
    <a
      href={link}
      className={`border rounded-2xl p-5 flex justify-between items-center transition-all ${alert
          ? "bg-rose-50 border-rose-100 hover:bg-rose-100 text-rose-700"
          : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
        }`}
    >
      <span className="font-medium">{title}</span>
      <span className={`text-xl font-bold px-3 py-1 rounded-full ${alert ? "bg-rose-200" : "bg-slate-100"}`}>
        {value || 0}
      </span>
    </a>
  );
}

function TableCard({ title, children }: any) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-semibold text-lg text-slate-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}