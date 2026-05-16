import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import { signOut } from '@/app/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/grading', label: 'Grading' },
    { href: '/admin/evaluation', label: 'Evaluation' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-20 navy-gradient shadow-lg">
        <div className="flex h-14 md:h-16 items-center gap-4 px-4 md:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="KONEK" width={34} height={34} className="drop-shadow-sm" />
            <div className="hidden sm:block">
              <span className="text-ivory font-serif text-base font-bold tracking-tight">KONEK</span>
              <span className="text-gold/70 text-[10px] ml-1.5 font-medium uppercase tracking-wider">Admin</span>
            </div>
          </Link>

          <div className="flex-1" />

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="px-3 py-1.5 rounded-md text-sm font-medium text-ivory/70 hover:text-gold hover:bg-ivory/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action={signOut} className="ml-2">
            <button 
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-ivory/20 text-ivory hover:bg-ivory/10 hover:text-gold text-xs h-8 px-3 font-medium transition-all"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Mobile nav - horizontal scroll */}
        <nav className="md:hidden flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="px-3 py-1.5 rounded-md text-xs font-medium text-ivory/70 hover:text-gold hover:bg-ivory/5 transition-all whitespace-nowrap flex-shrink-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
