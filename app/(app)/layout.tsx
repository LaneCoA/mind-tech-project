import BottomNav from '@/components/BottomNav'
import Sidebar from '@/components/ui/Sidebar'
import { bottomNavItems } from '@/config/bottomNav'

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
   <div className="min-h-screen bg-gray-50">
     {/* Sidebar → desktop */}
     <Sidebar items={bottomNavItems} />

     {/* Main content */}
     <main className="md:ml-64 pb-24 md:pb-0">
       {children}
     </main>

     {/* Bottom navigation → mobile */}
     <BottomNav items={bottomNavItems} />
   </div>
 )
}