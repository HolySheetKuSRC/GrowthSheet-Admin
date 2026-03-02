export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white items-center justify-center">
        {/* subtle light effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_40%)]" />

        <div className="relative text-center px-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            GrowthSheet
          </h1>
          <p className="text-gray-300 text-lg">
            Admin Management System
          </p>

          <div className="mt-10 text-sm text-gray-400">
            Secure • Fast • Reliable
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
        <div className="w-full max-w-md p-10 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}