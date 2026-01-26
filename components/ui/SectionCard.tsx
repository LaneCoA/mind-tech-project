import { ReactNode } from 'react'

type SectionCardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
}

export default function SectionCard({
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <section className="bg-white rounded-2xl shadow p-5 space-y-4">
      {(title || subtitle) && (
        <header>
          {title && (
            <h2 className="font-semibold">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
