import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import { LayoutDashboard, Award, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions'

export default async function TraineeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Desktop/Mobile Header */}
      <header className="sticky top-0 z-20 navy-gradient shadow-lg">
        <div className="flex h-14 md:h-16 items-center gap-3 px-4 md:px-6 max-w-4xl mx-auto w-full">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="KONEK" width={36} height={36} className="drop-shadow-sm" />
            <span className="text-ivory font-serif text-lg font-bold tracking-tight hidden sm:inline">KONEK</span>
          </Link>
          <div className="flex-1" />
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-5 text-sm font-medium">
            <Link href="/dashboard" className="text-ivory/80 hover:text-gold transition-colors">Dashboard</Link>
            <Link href="/certificate" className="text-ivory/80 hover:text-gold transition-colors">Certificate</Link>
          </nav>
          <form action={signOut} className="hidden md:block ml-3">
            <button type="submit" className="inline-flex items-center justify-center rounded-lg border border-ivory/20 text-ivory hover:bg-ivory/10 hover:text-gold text-xs h-8 px-3 font-medium transition-all">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-ivory border-t border-gold/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-navy hover:text-gold transition-colors py-2 px-4">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link href="/certificate" className="flex flex-col items-center gap-1 text-navy hover:text-gold transition-colors py-2 px-4">
            <Award className="h-5 w-5" />
            <span className="text-[10px] font-medium">Certificate</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex flex-col items-center gap-1 text-warm-gray hover:text-destructive transition-colors py-2 px-4">
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}
