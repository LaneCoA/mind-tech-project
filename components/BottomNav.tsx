'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  ShieldCheck,
  LogOut,
  Folder
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import type { BottomNavItem } from '@/config/bottomNav'

/* ---------- Icon Map ---------- */
const iconMap = {
  home: Home,
  users: Users,
  shield: ShieldCheck,
  logout: LogOut,
  folder: Folder
}

/* ---------- Component ---------- */
export default function BottomNav({
  items
}: {
  items: BottomNavItem[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowConfirm(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* ---------- Bottom Navigation ---------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
        <div className="max-w-5xl mx-auto flex justify-around py-3">

          {items.map(item => {
            const Icon = iconMap[item.icon]
            const active = pathname === item.path
            const isSecondary = item.variant === 'secondary'
            const isDocumentProcess = item.path === '/process'


            /* ---------- LOGOUT ---------- */
            if (item.icon === 'logout') {
              return (
                <button
                  key="logout"
                  onClick={() => setShowConfirm(true)}
                  className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-600 transition"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            }

            /* ---------- NAV LINKS ---------- */
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 transition ${
                  active
                    ? 'text-indigo-600 font-medium'
                    : isSecondary
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                <Icon
                  className={
                    isSecondary
                      ? 'h-4 w-4'
                      : 'h-5 w-5'
                  }
                />
                
                <span
                  className={`leading-tight whitespace-nowrap ${
                    isSecondary ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  {item.icon === 'folder' ? (
                    <>
                      <span className="md:hidden">Document</span>
                      <span className="hidden md:inline">Document Process</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>

              </Link>
            )
          })}
        </div>
      </nav>

      {/* ---------- Logout Confirmation Modal ---------- */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Sign out
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to sign out?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


