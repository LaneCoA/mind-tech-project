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

function highlightCandidateNames(text: string) {
  return text.replace(
    /(Nombre:\s*)(.+)/gi,
    '$1<strong>$2</strong>'
  )
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
        <p
          ref={textRef}
          className={`whitespace-pre-line text-sm text-gray-700 leading-relaxed
            ${!isExpanded ? 'line-clamp-8' : ''}
          `}
          dangerouslySetInnerHTML={{
            __html: highlightCandidateNames(text),
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

