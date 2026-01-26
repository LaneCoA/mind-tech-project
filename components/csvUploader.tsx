'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '@/lib/supabase'

/* ================= TYPES ================= */

type EmployeeCsvRow = {
  fullName?: string
  skills?: string
  seniority?: string
  roles?: string
  yearsOfExperience?: string
}

type CsvUploaderProps = {
  onSuccess?: () => void
}

/* ================= COMPONENT ================= */

export default function CsvUploader({
  onSuccess,
}: CsvUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileUpload = (file: File) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    Papa.parse<EmployeeCsvRow>(file, {
      header: true,
      skipEmptyLines: true,

      complete: async ({ data }) => {
        try {
          const employees = data
            .filter(row => row.fullName)
            .map(row => ({
              fullName: row.fullName!.trim(),
              skills: row.skills
                ? row.skills.split('|').map(s => s.trim())
                : [],
              seniority: row.seniority?.trim() ?? null,
              roles: row.roles
                ? row.roles.split('|').map(r => r.trim())
                : [],
              yearsOfExperience: row.yearsOfExperience
                ? Number(row.yearsOfExperience)
                : null,
            }))
            .filter(
              e =>
                e.fullName &&
                !Number.isNaN(e.yearsOfExperience ?? 0)
            )

          if (employees.length === 0) {
            throw new Error(
              'El CSV no contiene filas válidas'
            )
          }

          const { error } = await supabase
            .from('employees')
            .insert(employees)

          if (error) throw error

          setSuccess(
            ` ${employees.length} employees were loaded 🎉`
          )
          onSuccess?.()
        } catch (err: any) {
          setError(
            err.message ||
              'Error processing CSV file'
          )
        } finally {
          setLoading(false)
        }
      },

      error: err => {
        setError(err.message)
        setLoading(false)
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Template helper */}
      <div className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-700">
            CSV template
          </p>
          <p className="text-xs text-gray-500">
            Use this file as a basis. Separate skills and
            roles with <span className="font-mono">,</span>
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="shrink-0 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          Download Template
        </button>
      </div>

      {/* File input */}
      <input
        type="file"
        accept=".csv"
        disabled={loading}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="block w-full text-sm
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:bg-indigo-600 file:text-white
          hover:file:bg-indigo-700
          disabled:opacity-50"
      />

      {/* States */}
      {loading && (
        <p className="text-sm text-blue-500">
          Cargando CSV...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-500">
          {success}
        </p>
      )}
    </div>
  )
}

/* ================= TEMPLATE DOWNLOAD ================= */

const CSV_TEMPLATE_HEADERS = [
  'fullName',
  'skills',
  'yearsOfExperience',
  'seniority',
  'roles',
]

const CSV_TEMPLATE_SAMPLE = [
  {
    fullName: 'Jane Doe',
    skills: 'React | TypeScript | SQL',
    yearsOfExperience: '5',
    seniority: 'Senior',
    roles: 'Frontend Developer',
  },
]

const downloadTemplate = () => {
  const csv = Papa.unparse({
    fields: CSV_TEMPLATE_HEADERS,
    data: CSV_TEMPLATE_SAMPLE.map(Object.values),
  })

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'employees_template.csv'
  link.click()

  URL.revokeObjectURL(url)
}

