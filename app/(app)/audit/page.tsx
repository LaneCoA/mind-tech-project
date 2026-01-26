'use client'

import Chat from '@/components/chatInput'
import SuggestedCandidates from '@/components/suggestedCandidates'
import SectionCard from '@/components/ui/SectionCard'

export default function AuditPage() {
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Header */}
        <h1 className="text-xl font-semibold">Audit Detail</h1>

         <SectionCard title="Suggested Candidates">
            <SuggestedCandidates />
        </SectionCard>

        

        {/* Audit Chat */}
        <SectionCard title="Audit Chat">
            <Chat />
        </SectionCard>

      </div>
    </div>
  )
}