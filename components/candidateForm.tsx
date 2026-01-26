'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Employee = {
  id: string
  fullName: string
  seniority: string | null
  skills: string[]
  yearsOfExperience: number | null
}

type Props = {
  initialData?: Employee
  onSuccess: () => void
}

const SENIORITY_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead']

export default function CandidateForm({
  initialData,
  onSuccess,
}: Props) {
  /* ================= STATE ================= */

  const [fullName, setFullName] = useState('')
  const [seniority, setSeniority] = useState('')
  const [years, setYears] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* ================= PRELOAD (EDIT MODE) ================= */

  useEffect(() => {
    if (!initialData) {
      // ADD mode → limpiar
      setFullName('')
      setSeniority('')
      setYears('')
      setSkills('')
      setError('')
      return
    }

    // EDIT mode → precargar
    setFullName(initialData.fullName)
    setSeniority(initialData.seniority ?? '')
    setYears(
      initialData.yearsOfExperience?.toString() ?? ''
    )
    setSkills(initialData.skills.join(', '))
    setError('')
  }, [initialData])

  /* ================= SUBMIT ================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()
    setError('')

    if (
      !fullName.trim() ||
      !seniority ||
      !years ||
      !skills.trim()
    ) {
      setError('All fields are required')
      return
    }

    setLoading(true)

    const payload = {
      fullName: fullName.trim(),
      seniority,
      yearsOfExperience: Number(years),
      skills: skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    }

    const query = initialData
      ? supabase
          .from('employees')
          .update(payload)
          .eq('id', initialData.id)
          .select()
      : supabase.from('employees').insert(payload).select()

    const { data, error } = await query

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    onSuccess()
  }

  /* ================= RENDER ================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold">
        {initialData
          ? 'Edit employee'
          : 'Add employee'}
      </h2>

      {/* Full name */}
      <div>
        <label className="text-sm font-medium">
          Full name
        </label>
        <input
          value={fullName}
          onChange={e =>
            setFullName(e.target.value)
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Seniority */}
      <div>
        <label className="text-sm font-medium">
          Seniority
        </label>
        <select
          value={seniority}
          onChange={e =>
            setSeniority(e.target.value)
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          required
        >
          <option value="">Select</option>
          {SENIORITY_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Years */}
      <div>
        <label className="text-sm font-medium">
          Years of experience
        </label>
        <input
          type="number"
          min={0}
          value={years}
          onChange={e =>
            setYears(e.target.value)
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="5"
          required
        />
      </div>

      {/* Skills */}
      <div>
        <label className="text-sm font-medium">
          Skills (comma separated)
        </label>
        <input
          value={skills}
          onChange={e =>
            setSkills(e.target.value)
          }
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="React, TypeScript, SQL"
          required
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading
            ? 'Saving...'
            : initialData
            ? 'Save changes'
            : 'Add employee'}
        </button>
      </div>
    </form>
  )
}


