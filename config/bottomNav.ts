export type BottomNavItem = {
  label: string
  path: string
  icon: 'home' | 'users' | 'shield' | 'logout' | 'folder'
  variant?: 'primary' | 'secondary' | 'danger'
}

export const bottomNavItems: BottomNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Employees', path: '/employees', icon: 'users' },
  { label: 'Audit', path: '/audit', icon: 'shield' },

  // 👇 opción secundaria (menos importante)
  { label: 'Document Process', path: '/process', icon: 'folder'},

  // 👇 acción peligrosa / especial
  { label: 'Logout', path: '/logout', icon: 'logout', variant: 'danger' }
]
