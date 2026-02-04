import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/google/callback"
  );

  const { tokens } = await oauth2Client.getToken(code!);

  console.log("TOKENS:", tokens);

  // 🔥 Guarda el refresh_token en ENV o BD
  return NextResponse.json(tokens);
}
