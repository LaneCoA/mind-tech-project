'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type SuggestedCandidate = {
  id: string
  requester_content: string | null
  returned_list: string | null
  requester: string | null
  created_at: string
}

const PAGE_SIZE = 10

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatCandidateText(text: string) {
  if (!text) return ''

  // 1️⃣ Normalizar saltos de línea
  let result = text
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // 2️⃣ Separar candidatos (antes de "Nombre completo")
  result = result.replace(
    /\n(?=Nombre(?:\s+completo)?\s*:)/gi,
    '\n---CANDIDATE---\n'
  )

  const candidates = result.split('---CANDIDATE---')

  return candidates
    .map(candidate => {
      let c = candidate.trim()

      // 🔹 Nombre → título
      c = c.replace(
        /Nombre(?:\s+completo)?\s*:\s*([^\n]+)/gi,
        `<div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:4px">$1</div>`
      )

      // 🔹 Meta info
      c = c.replace(
        /(Seniority:\s*[^\n]+|Años de experiencia:\s*[^\n]+|Roles:\s*[^\n]+)/gi,
        `<div style="font-size:12px;color:#6b7280">$1</div>`
      )

      // 🔹 Ubicación → línea separada
      c = c.replace(
        /(Ubicación|Location)\s*:\s*([^\n]+)/gi,
        `<div style="font-size:12px;color:#6b7280;margin-top:2px">$1: $2</div>`
      )

      // 🔹 Skills → pills
      c = c.replace(
        /Habilidades:\s*([^\n]+)/gi,
        (_, skills) => {
          const pills = skills
            .split(',')
            .map(
              (s: string) =>
                `<span style="
                  display:inline-block;
                  margin:2px 4px 0 0;
                  padding:2px 8px;
                  font-size:11px;
                  border-radius:9999px;
                  background:#eef2ff;
                  color:#4338ca;
                ">${s.trim()}</span>`
            )
            .join('')

          return `<div style="margin-top:6px">${pills}</div>`
        }
      )

      // 🔹 Link CV → botón
      c = c.replace(
        /(Link\s*CV|CV\s*Link)\s*:\s*(?:\n\s*)?(https?:\/\/[^\s\n]+)/gi,
        `<div style="margin-top:8px">
          <a href="$2" target="_blank" rel="noopener noreferrer"
            style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              margin-top:6px;
              font-size:12px;
              font-weight:500;
              color:#4f46e5;
              text-decoration:none;
            ">
            📄 Ver CV
          </a>
        </div>`
      )

      // 🔹 Quitar "Link CV:" vacío
      c = c.replace(/Link CV:\s*\n?/gi, '')

      // 🔹 Envolver cada candidato en una card visual
      return `
        <div style="
          padding:12px;
          border-radius:8px;
          background:#ffffff;
          border:1px solid #e5e7eb;
          margin-bottom:12px;
        ">
          ${c}
        </div>
      `
    })
    .join('')
}

function RequesterBadge({ requester }: { requester: string | null }) {
  if (!requester) return null

  const isAdmin = requester.toLowerCase() === 'admin user'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
        ${
          isAdmin
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}
    >
      {isAdmin ? '🖥️' : '💬'}
      {requester}
    </span>
  )
}

/* =========================
   ExpandableText COMPONENT
========================= */
function ExpandableText({
  id,
  text,
  isExpanded,
  onToggle,
}: {
  id: string
  text: string
  isExpanded: boolean
  onToggle: (id: string) => void
}) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [canExpand, setCanExpand] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    // Detecta overflow real
    if (el.scrollHeight > el.clientHeight) {
      setCanExpand(true)
    }
  }, [text])

  return (
    <>
      <div className="rounded-lg border bg-gray-50 p-4">
        <div
          ref={textRef}
          className={`text-sm text-gray-700 leading-relaxed
            ${!isExpanded ? 'line-clamp-9' : ''}
          `}
          dangerouslySetInnerHTML={{
            __html: formatCandidateText(text),
          }}
        />
      </div>

      {canExpand && (
        <button
          onClick={() => onToggle(id)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  )
}

/* =========================
   MAIN COMPONENT
========================= */
export default function SuggestedCandidates() {
  const [data, setData] = useState<SuggestedCandidate[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const loadSuggestedCandidates = async (pageNumber = 0) => {
    setLoading(true)

    const from = pageNumber * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: newData, error } = await supabase
      .from('prompts')
      .select(`
        id,
        requester_content,
        returned_list,
        requester,
        created_at
      `)
      .not('returned_list', 'is', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setData(prev =>
        pageNumber === 0 ? newData ?? [] : [...prev, ...(newData ?? [])]
      )

      if (!newData || newData.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSuggestedCandidates(0)
  }, [])

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-6">
      {data.map(prompt => {
        const isExpanded = expanded[prompt.id] ?? false
        const text = prompt.returned_list ?? ''

        return (
          <div
            key={prompt.id}
            className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-indigo-500">
                  Original Prompt
                </p>
                <p className="text-sm text-gray-800">
                  {prompt.requester_content}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(prompt.created_at)}
                </p>
              </div>

              <RequesterBadge requester={prompt.requester} />
            </div>

            {/* RETURNED CANDIDATES */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                Returned Candidates
              </h4>

              <ExpandableText
                id={prompt.id}
                text={text}
                isExpanded={isExpanded}
                onToggle={toggleExpanded}
              />
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              const next = page + 1
              setPage(next)
              loadSuggestedCandidates(next)
            }}
            disabled={loading}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'View more'}
          </button>
        </div>
      )}
    </div>
  )
}

