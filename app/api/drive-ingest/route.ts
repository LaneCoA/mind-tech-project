export async function POST() {
  const res = await fetch(process.env.N8N_DRIVE_WEBHOOK!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
    },
    body: JSON.stringify({
      source: 'google-drive',
      triggeredBy: 'manual',
    }),
  })

  if (!res.ok) {
    return Response.json({ error: 'Failed to trigger workflow' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
