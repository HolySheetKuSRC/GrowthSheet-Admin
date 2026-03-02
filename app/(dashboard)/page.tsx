// app/(dashboard)/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header สไตล์เดียวกับหน้า Sellers */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          ยินดีต้อนรับสู่ระบบจัดการ GrowthSheet
        </p>
      </div>

      {/* Card สีขาวที่มีเงาเหมือนหน้า Sellers */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border p-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">ยินดีต้อนรับกลับมา!</h2>
          <p className="text-gray-600">
            ขณะนี้คุณกำลังใช้งานหน้า Dashboard
          </p>
          
          <div className="mt-6 p-10 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center">
             <span className="text-gray-400 font-medium">Dashboard Content Area</span>
          </div>
        </div>
      </div>
    </div>
  );
}