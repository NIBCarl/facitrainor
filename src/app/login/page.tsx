'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream px-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B2A4A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <Card className="w-full max-w-sm border-gold/30 shadow-xl bg-ivory relative z-10">
        {/* Gold top accent */}
        <div className="h-1.5 gold-gradient rounded-t-lg" />

        <CardHeader className="space-y-4 text-center pt-8 pb-2">
          <div className="mx-auto">
            <Image
              src="/logo.png"
              alt="KONEK Logo"
              width={140}
              height={140}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>
          <div>
            <p className="text-sm text-warm-gray font-medium tracking-wide uppercase">
              Keeping Outreach Near Every Community for the Kingdom
            </p>
          </div>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4 px-6">
            {error && (
              <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive font-medium text-center border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-navy font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required
                className="h-12 bg-cream/50 border-gold/20 focus-visible:ring-gold focus-visible:border-gold placeholder:text-warm-gray/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-navy font-medium">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-12 bg-cream/50 border-gold/20 focus-visible:ring-gold focus-visible:border-gold"
              />
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold navy-gradient text-ivory hover:opacity-90 transition-opacity shadow-md" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
