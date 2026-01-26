'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Home,
  Users,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import type { BottomNavItem } from '@/config/bottomNav'

const iconMap = {
  home: Home,
  users: Users,
  shield: ShieldCheck,
  logout: LogOut,
}

export default function Sidebar({
  items,
}: {
  items: BottomNavItem[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col bg-indigo-50">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow">
            T
          </div>
          <span className="text-lg font-semibold text-gray-900">
            Talent UI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {items
          .filter(item => item.icon !== 'logout')
          .map(item => {
            const Icon = iconMap[item.icon]
            const active = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all
                  ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm font-medium'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active
                      ? 'text-indigo-600'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {item.label}
              </Link>
            )
          })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-600 transition
            hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          Log out
        </button>
      </div>
    </aside>
  )
}


