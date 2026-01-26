type Row = {
  suggested: string | null
  required_skills?: string[] | null
}

export function countBySuggested(data: Row[]) {
  const counter: Record<string, number> = {}

  data.forEach(row => {
    if (!row.suggested) return

    // si quieres contar SOLO cuando haya required_skills:
    // if (!row.required_skills || row.required_skills.length === 0) return

    counter[row.suggested] = (counter[row.suggested] || 0) + 1
  })

  return Object.entries(counter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
