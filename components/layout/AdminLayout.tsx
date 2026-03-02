import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="p-6 bg-gray-50 h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}