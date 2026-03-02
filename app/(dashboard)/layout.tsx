// app/(dashboard)/layout.tsx
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar เมนูด้านข้างที่ใช้ร่วมกันทุกหน้าในกลุ่ม (dashboard) */}
      <Sidebar />
      
      {/* พื้นที่เนื้อหาหลัก ขยับ ml-64 (256px) เพื่อไม่ให้ Sidebar ทับเนื้อหา */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}