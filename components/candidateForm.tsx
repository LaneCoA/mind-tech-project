'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Employee = {
  id: string
  fullName: string
  seniority: string | null
  skills: string[]
  yearsOfExperience: number | null
  position: string | null
  location: string | null
  cv_link?: string | null
}

type Props = {
  initialData?: Employee
  onSuccess: () => void
}

const SENIORITY_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead']

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export default function CandidateForm({
  initialData,
  onSuccess,
}: Props) {
  const isEdit = Boolean(initialData?.id)

  /* ================= STATE ================= */

  const [fullName, setFullName] = useState('')
  const [seniority, setSeniority] = useState('')
  const [years, setYears] = useState('')
  const [skills, setSkills] = useState('')
  const [location, setLocation] = useState('')
  const [position, setPosition] = useState('')
  const [cvLink, setCvLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* ================= RESET ================= */

  const resetForm = () => {
    setFullName('')
    setSeniority('')
    setYears('')
    setSkills('')
    setLocation('')
    setPosition('')
    setCvLink('')
    setError('')
  }

  /* ================= PRELOAD ================= */

  useEffect(() => {
    if (!isEdit) {
      resetForm()
      return
    }

    setFullName(initialData!.fullName)
    setSeniority(initialData!.seniority ?? '')
    setYears(initialData!.yearsOfExperience?.toString() ?? '')
    setSkills(initialData!.skills.join(', '))
    setLocation(initialData!.location ?? '')
    setPosition(initialData!.position ?? '')
    setCvLink(initialData!.cv_link ?? '')
    setError('')
  }, [isEdit, initialData])

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !seniority || !years || !skills.trim()) {
      setError('All required fields must be filled')
      return
    }

    if (cvLink && !isValidUrl(cvLink)) {
      setError('CV link must be a valid URL')
      return
    }

    setLoading(true)

    const normalizedCv = cvLink.trim() || null

    /* ===== DUPLICATE CHECK (ONLY CV) ===== */
    
    if (normalizedCv) {
      let query = supabase
        .from('employees')
        .select('id')
        .eq('cv_link', normalizedCv)
        .is('deleted_at', null)

      if (isEdit && initialData?.id) {
        query = query.neq('id', initialData!.id)
      }

      const { data, error } = await query.maybeSingle()
      if (error) {
      setLoading(false)
      setError(error.message)
      return
      }
      if (data) {
        setLoading(false)
        setError('An employee with the same CV already exists')
        return
      }
    }

    /* ===== PAYLOAD ===== */

    const payload = {
      fullName: fullName.trim(),
      seniority,
      yearsOfExperience: Number(years),
      skills: skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      //cv_link: normalizedCv ?? null,
      location,
      position,
    }
    
    /* ===== SAVE ===== */

    const { error } = isEdit
      ? await supabase
          .from('employees')
          .update(payload)
          .eq('id', initialData!.id)
      : await supabase
          .from('employees')
          .insert(payload)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    resetForm()
    onSuccess()
  }

  /* ================= RENDER ================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? 'Edit employee' : 'Add employee'}
      </h2>

      <div>
        <label className="text-sm font-medium">Full name</label>
        <input
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Seniority</label>
        <select
          value={seniority}
          onChange={e => setSeniority(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          required
        >
          <option value="">Select</option>
          {SENIORITY_OPTIONS.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">
          Years of experience
        </label>
        <input
          type="number"
          min={0}
          value={years}
          onChange={e => setYears(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="5"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Skills (comma separated)
        </label>
        <input
          value={skills}
          onChange={e => setSkills(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="React, TypeScript, SQL"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Location (optional)
        </label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Tijuana"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Position (optional)
        </label>
        <input
          value={position}
          onChange={e => setPosition(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Developer"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          CV link (optional)
        </label>
        <input
          type="url"
          value={cvLink}
          onChange={e => setCvLink(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="https://drive.google.com/..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end pt-4">
        <button
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? 'Saving...'
            : isEdit
            ? 'Save changes'
            : 'Add employee'}
        </button>
      </div>
    </form>
  )
}
