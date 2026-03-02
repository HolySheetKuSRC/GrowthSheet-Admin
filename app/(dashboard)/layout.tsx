import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar คงที่ด้านซ้าย */}
      <Sidebar />
      
      {/* พื้นที่เนื้อหาหลัก ขยับ margin-left ให้พ้นระยะ Sidebar (w-64) */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}