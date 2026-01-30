type Row = {
  required_seniority: any
  created_at: string
}

/**
 * Normaliza seniority para evitar variantes:
 * "Tech Lead", "lead engineer" → "Lead"
 * "senior", "Senior Dev" → "Senior"
 * etc.
 */
function normalizeSeniority(raw: string): string {
  const s = raw.toLowerCase()

  if (s.includes('lead')) return 'Lead'
  if (s.includes('senior')) return 'Senior'
  if (s.includes('mid')) return 'Mid'
  if (s.includes('junior') || s.includes('jr')) return 'Junior'

  // fallback: capitaliza
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function countRequiredSeniorityByTimestamp(data: Row[]) {
  const timestampSeniorityMap = new Map<string, Set<string>>()

  data.forEach(row => {
    if (!row.required_seniority) return

    let seniorityArray: string[] = []

    // Caso 1: ya es array
    if (Array.isArray(row.required_seniority)) {
      seniorityArray = row.required_seniority
    }
    // Caso 2: string
    else if (typeof row.required_seniority === 'string') {
      const trimmed = row.required_seniority.trim()

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Intentamos parsear JSON
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) seniorityArray = parsed
        } catch {
          seniorityArray = [trimmed]
        }
      } else {
        seniorityArray = [trimmed]
      }
    } else {
      return
    }

    // Limpieza básica
    const seniorities = seniorityArray
      .filter(s => typeof s === 'string')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (seniorities.length === 0) return

    // Timestamp normalizado
    const date = new Date(row.created_at)
    if (isNaN(date.getTime())) return

    const ts = date.toISOString().slice(0, 19)

    if (!timestampSeniorityMap.has(ts)) {
      timestampSeniorityMap.set(ts, new Set())
    }

    // 👇 NORMALIZACIÓN AQUÍ
    seniorities.forEach(seniority => {
      const normalized = normalizeSeniority(seniority)
      timestampSeniorityMap.get(ts)!.add(normalized)
    })
  })

  // Conteo final por seniority
  const seniorityCountMap = new Map<string, number>()

  timestampSeniorityMap.forEach(set => {
    set.forEach(seniority => {
      seniorityCountMap.set(
        seniority,
        (seniorityCountMap.get(seniority) || 0) + 1
      )
    })
  })

  const seniorityByFrequency = Array.from(seniorityCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([seniority, count]) => ({ seniority, count }))

  return {
    seniorityByFrequency,
    totalTimestamps: timestampSeniorityMap.size,
  }
}


