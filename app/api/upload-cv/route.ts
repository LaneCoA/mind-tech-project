export const runtime = 'nodejs';

import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  console.log('📥 POST /api/upload-cv hit');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    console.log('📄 File:', file?.name, file?.type);

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 🔍 Detect extension
    const extension = file.name.split('.').pop()?.toLowerCase();

    console.log('📎 Extension detected:', extension);

    if (!extension || !['csv', 'docx'].includes(extension)) {
      return Response.json(
        { error: 'Only CSV or DOCX files allowed' },
        { status: 400 }
      );
    }

    // 🧠 Mime types
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      docx:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const mimeType = mimeTypes[extension];
    console.log('🧪 Mime type:', mimeType);

    // 🔐 ENV CHECK
    console.log('🔐 ENV CHECK:', {
      hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasFolder: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
    });

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN ||
      !process.env.GOOGLE_DRIVE_FOLDER_ID
    ) {
    return Response.json(
    { error: 'Missing Google OAuth env vars' },
    { status: 500 }
    );
  }

    // 🔐 Google Auth
    const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // 📦 File → stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    console.log('⬆️ Uploading to Google Drive...');

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType,
        body: stream,
      },
    });

    console.log('✅ Upload success:', response.data);

    return Response.json({
      success: true,
      fileId: response.data.id,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('❌ Upload failed');
    console.error(error);
    console.error('❌ Google error details:', error?.response?.data);

    return Response.json(
      {
        error: 'Upload failed',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}