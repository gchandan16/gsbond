import { asyncHandler } from "../../../utils/asyncHandler";
import { AppError } from "../../../utils/errorHandler";

export const POST = asyncHandler(async (req) => {

  const isProd =true || process.env.NODE_ENV === "production";

  // ✅ Delete cookies via header - same way they were set in login
  const expiredCookies = [
    `authToken=; Path=/; ${isProd 
      ? "HttpOnly; Secure; SameSite=None; Domain=crm.gsbondcleaning.com.au;" 
      : "SameSite=Lax;"} Max-Age=0`,

    `role=; Path=/; ${isProd 
      ? "HttpOnly; Secure; SameSite=None; Domain=crm.gsbondcleaning.com.au;" 
      : "SameSite=Lax;"} Max-Age=0`,
  ];

  return new Response(JSON.stringify({ 
    success: true, 
    message: "Logged out" 
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": expiredCookies.join(", "), // ✅ Max-Age=0 deletes the cookie
    }
  });
});