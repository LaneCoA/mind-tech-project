export type BottomNavItem = {
  label: string
  path: string
  icon: 'home' | 'users' | 'shield' | 'logout'
}

export const bottomNavItems: BottomNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Employees', path: '/employees', icon: 'users' },
  { label: 'Audit', path: '/audit', icon: 'shield' },
  { label: 'Logout', path: '/logout', icon: 'logout' }
]
