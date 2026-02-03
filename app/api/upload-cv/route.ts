import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
  scopes: ['https://www.googleapis.com/auth/drive']
})

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  // 🔴 VALIDACIÓN AQUÍ
  if (
    !file ||
    file.type !==
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return NextResponse.json(
      { error: 'Only .docx files are allowed' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const drive = google.drive({
    version: 'v3',
    auth
  })

  const res = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      mimeType: 'application/vnd.google-apps.document' // 👈 conversión
    },
    media: {
      mimeType: file.type,
      body: Readable.from(buffer)
    }
  })
  const fileId = res.data.id

  if (!fileId) {
    throw new Error('Failed to upload file to Drive')
  }

  // 2️⃣ TRANSFERIR OWNERSHIP (🔥 CLAVE)
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'user',
      role: 'owner',
      emailAddress: process.env.GOOGLE_OWNER_EMAIL! // 👈 TU GMAIL
    },
    transferOwnership: true
  })


  return NextResponse.json({
    success: true,
    id: fileId,
    name: file.name
  })
}
