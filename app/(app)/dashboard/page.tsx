export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { countRequiredSkillsByTimestamp } from '@/lib/countRequiredSkillsByTimestamp'
import { countRequiredSeniorityByTimestamp } from '@/lib/countRequiredSeniorityByTimestamp'
import { countBySuggested } from '@/lib/countBySuggested'
import SectionCard from '@/components/ui/SectionCard'

type Row = {
  suggested: string | null
  skills: string[] | null
  required_skills: any
  required_seniority: any
  created_at: string
}

export default async function MetricsPage() {
  const { data = [], error } = await supabase
    .from('metrics')
    .select(
      'suggested, skills, required_skills, required_seniority, created_at'
    )

  if (error || !data) {
    return <div>Error cargando métricas</div>
  }

  const requiredSkillsEvents =
    countRequiredSkillsByTimestamp(data as Row[]) || {
      skillsByFrequency: [],
      totalTimestamps: 0
    }

  const requiredSeniorityEvents =
    countRequiredSeniorityByTimestamp(data as Row[]) || {
      seniorityByFrequency: [],
      totalTimestamps: 0
    }

  const suggestedCount = countBySuggested(data)

  const maxSkillCount = Math.max(
    ...requiredSkillsEvents.skillsByFrequency.map(s => s.count),
    1
  )
  const maxSeniorityCount = Math.max(
  ...requiredSeniorityEvents.seniorityByFrequency.map(e => e.count),
  1
)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            label="Required unique skills"
            value={requiredSkillsEvents.totalTimestamps}
          />
          <MetricCard
            label="Required unique seniority"
            value={requiredSeniorityEvents.totalTimestamps}
          />
          <MetricCard
            label="Single candidates"
            value={suggestedCount.length}
          />
        </div>

        {/* Skill Demand Trends */}
        <SectionCard
          title="Skill Demand Trends"
          subtitle="Ranking required skills"
        >
          <div className="space-y-4">
            {requiredSkillsEvents.skillsByFrequency.map(
              ({ skill, count }) => {
                const percent = Math.round(
                  (count / maxSkillCount) * 100
                )

                return (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </SectionCard>

        {/* Ranking por candidato */}
        <SectionCard
          title="Top Suggested"
          subtitle="Ranking by candidate"
        >
          <div className="space-y-3">
            {suggestedCount.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between border rounded-xl p-3 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.count} apariciones
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Ranking Required Seniority */}
        <SectionCard
          title="Required Seniority"
          subtitle="Ranking of required seniority"
        >
          <div className="space-y-4">
            {requiredSeniorityEvents.seniorityByFrequency.map(
              ({ seniority, count }) => {
                const percent = Math.round(
                  (count / maxSeniorityCount) * 100
                )

                return (
                  <div key={seniority}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{seniority}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

/* ---------------- UI COMPONENTS ---------------- */

function MetricCard({
  label,
  value
}: {
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  )
}

