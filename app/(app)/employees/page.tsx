'use client'

import { useEffect, useMemo, useState } from 'react'
import CandidateForm from '@/components/candidateForm'
import { supabase } from '@/lib/supabase'
import CsvUploader from '@/components/csvUploader'
import SectionCard from '@/components/ui/SectionCard'

/* ================= TYPES ================= */

type Employee = {
  id: string
  fullName: string
  seniority: string | null
  skills: string[]
  yearsOfExperience: number | null
}

const SENIORITY_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead']

/* ================= PAGE ================= */

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const [uploading, setUploading] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] =
    useState<Employee | null>(null)

  /* Filters */
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedSeniority, setSelectedSeniority] = useState('')
  const [selectedYears, setSelectedYears] = useState('')

  /* ================= LOAD DATA ================= */

  const loadEmployees = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('employees')
      .select(
        'id, fullName, seniority, skills, yearsOfExperience'
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setEmployees(
      (data ?? []).map(e => ({
        ...e,
        skills: Array.isArray(e.skills) ? e.skills : [],
      }))
    )

    setLoading(false)
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  /* ================= UNIQUE SKILLS ================= */

  const skillOptions = useMemo(() => {
    const set = new Set<string>()
    employees.forEach(e =>
      e.skills.forEach(s => set.add(s))
    )
    return Array.from(set).sort()
  }, [employees])

  /* ================= FILTERED DATA ================= */

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.fullName
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchSkill = selectedSkill
        ? e.skills.includes(selectedSkill)
        : true

      const matchSeniority = selectedSeniority
        ? e.seniority === selectedSeniority
        : true

      const matchYears = (() => {
        if (!selectedYears) return true
        const years = e.yearsOfExperience ?? 0
        if (selectedYears === '0-2') return years <= 2
        if (selectedYears === '3-5')
          return years >= 3 && years <= 5
        if (selectedYears === '6+') return years >= 6
        return true
      })()

      return (
        matchSearch &&
        matchSkill &&
        matchSeniority &&
        matchYears
      )
    })
  }, [
    employees,
    search,
    selectedSkill,
    selectedSeniority,
    selectedYears,
  ])

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!employeeToDelete) return

    await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', employeeToDelete.id)

    setEmployees(prev =>
      prev.filter(e => e.id !== employeeToDelete.id)
    )

    setEmployeeToDelete(null)
    setShowConfirm(false)
  }

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <main className="p-6 space-y-6">
          {/* Header */}
          <h1 className="text-xl font-semibold">Employees</h1>

        
          {/* Upload CV */}
            <SectionCard
              title="Import employees"
              subtitle="Upload a CSV file"
            >
          <CsvUploader
          
            onSuccess={() => {
              loadEmployees()
            }}
           />
           
           </SectionCard>

        {/* Search */}
        <input
          placeholder="Search employee..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setSelectedSeniority('')}
            className={`px-3 py-1 rounded-full text-sm border ${
              !selectedSeniority
                ? 'bg-indigo-600 text-white'
                : 'bg-white'
            }`}
          >
            All
          </button>

          {SENIORITY_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() =>
                setSelectedSeniority(
                  selectedSeniority === s ? '' : s
                )
              }
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedSeniority === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white'
              }`}
            >
              {s}
            </button>
          ))}

          <select
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
            className="ml-auto rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All skills</option>
            {skillOptions.map(skill => (
              <option key={skill}>{skill}</option>
            ))}
          </select>

          <select
            value={selectedYears}
            onChange={e => setSelectedYears(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All years</option>
            <option value="0-2">0–2 years</option>
            <option value="3-5">3–5 years</option>
            <option value="6+">6+ years</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-gray-500">
            Loading employees...
          </p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-sm text-gray-500">
            No employees found
          </p>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map(emp => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={() => setEditing(emp)}
                onDelete={() => {
                  setEmployeeToDelete(emp)
                  setShowConfirm(true)
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>

      {/* Floating add */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[110px] right-6 h-14 w-14 rounded-full bg-indigo-600 text-white text-3xl shadow-lg z-40"
      >
        +
      </button>

      {/* Add modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <CandidateForm
            onSuccess={() => {
              setShowAdd(false)
              loadEmployees()
            }}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <CandidateForm
            initialData={editing}
            onSuccess={() => {
              setEditing(null)
              loadEmployees()
            }}
          />
        </Modal>
      )}

      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
          />

          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete employee
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium">
                {employeeToDelete?.fullName}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= COMPONENTS ================= */

function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <p className="font-semibold text-sm">
          {employee.fullName}
        </p>

        <p className="text-xs text-gray-500">
          {employee.seniority ?? '—'} ·{' '}
          {employee.yearsOfExperience ?? 0} yrs
        </p>

        <div className="flex flex-wrap gap-1 mt-1">
          {employee.skills.map(skill => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 text-lg">
        <button onClick={onEdit}>✏️</button>
        <button onClick={onDelete}>🗑</button>
      </div>
    </div>
  )
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

