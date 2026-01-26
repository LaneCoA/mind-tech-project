export function countRequiredSkillsByTimestamp(data: Row[]) {
  const timestampSkillsMap = new Map<string, Set<string>>()

  data.forEach(row => {
    if (!row.required_skills) return

    let skillsArray: any[] = []

    if (Array.isArray(row.required_skills)) {
      skillsArray = row.required_skills
    } else if (typeof row.required_skills === 'string') {
      try {
        const parsed = JSON.parse(row.required_skills)
        if (Array.isArray(parsed)) skillsArray = parsed
      } catch {
        return
      }
    } else {
      return
    }

    const skills = skillsArray
      .filter(skill => typeof skill === 'string')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)

    if (skills.length === 0) return

    const date = new Date(row.created_at)
    if (isNaN(date.getTime())) return

    const ts = date.toISOString().slice(0, 19)

    if (!timestampSkillsMap.has(ts)) {
      timestampSkillsMap.set(ts, new Set())
    }

    skills.forEach(skill => {
      timestampSkillsMap.get(ts)!.add(skill)
    })
  })

  const skillCountMap = new Map<string, number>()

  timestampSkillsMap.forEach(set => {
    set.forEach(skill => {
      skillCountMap.set(skill, (skillCountMap.get(skill) || 0) + 1)
    })
  })

  const skillsByFrequency = Array.from(skillCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({ skill, count }))

  return {
    skillsByFrequency,
    totalTimestamps: timestampSkillsMap.size,
  }
}
