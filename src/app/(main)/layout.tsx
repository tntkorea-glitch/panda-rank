import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
