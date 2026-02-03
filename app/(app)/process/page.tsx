'use client'

import { useState } from 'react'
import SectionCard from '@/components/ui/SectionCard'

export default function DocumentIngestPage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'ok' | 'error'
  >('idle')
  //const [message, setMessage] = useState<string | null>(null)

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadStatus('idle')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error()
      setUploadStatus('ok')
    } catch {
      setUploadStatus('error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const triggerWorkflow = async () => {
    setLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/drive-ingest', {
        method: 'POST',
      })

      if (!res.ok) throw new Error()
      setStatus('ok')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Header */}
        <h1 className="text-xl font-semibold">Document Process</h1>

        {/* Description */}
        <SectionCard title="Google Drive Sync">
          <p className="text-sm text-gray-600">
            This process reads documents from Google Drive and adds or updates employee information.
          </p>

          <button
            onClick={triggerWorkflow}
            disabled={loading}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm"
          >
            {loading ? 'Processing…' : 'Read documents from Drive'}
          </button>

          {status === 'ok' && (
            <p className="mt-3 text-sm text-green-600">
              ✅ Workflow triggered successfully, All information was added/updated into database 
            </p>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-red-600">
              ❌ Something went wrong, contact the Administrator
            </p>
          )}
        </SectionCard>

        {/* Card 2 */}
        <SectionCard title="Manual Upload">
          <p className="text-sm text-gray-600">
            Upload a document manually to Google Drive for processing.
            Only .docx files are supported. Files will be converted to Google Docs.
          </p>

          <div className="mt-4 flex items-center gap-3">
            {/* Input oculto */}
            <input
              type="file"
              accept=".docx"
              id="manual-upload"
              className="hidden"
              onChange={handleUpload}
            />

            {/* Botón */}
            <label
              htmlFor="manual-upload"
              className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
              Upload file
            </label>

            {/* Texto */}
            <span className="text-sm text-gray-500">
              No file chosen
            </span>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

