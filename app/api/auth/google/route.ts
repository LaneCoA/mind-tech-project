import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production'? 'https://mind-tech-project.vercel.app/api/auth/google/callback': 'http://localhost:3000/api/auth/google/callback'
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // 🔥 IMPORTANTE para refresh token
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent"
  });

  return NextResponse.redirect(url);
}
