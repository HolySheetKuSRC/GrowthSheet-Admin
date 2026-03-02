import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  const { pathname } = request.nextUrl;

  // ถ้าเข้า /login แล้วมี token → เด้งกลับหน้าแรก
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ถ้าเข้า path อื่น (เช่น /, /sellers, /sheets)
  // แล้วไม่มี token → redirect ไป login
  if (
    !token &&
    pathname !== "/login"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match ทั้งหมด ยกเว้น:
     * 1. /api (API routes)
     * 2. /_next (static files ของ Next.js)
     * 3. /static, /images, favicon.ico (ไฟล์รูปภาพต่างๆ)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};