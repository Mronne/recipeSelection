'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin, isLoggedIn } from '@/lib/auth'

type RequiredRole = 'logged-in' | 'admin'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: RequiredRole
}

export default function ProtectedRoute({ children, requiredRole = 'logged-in' }: ProtectedRouteProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.replace('/login')
      return
    }
    if (requiredRole === 'logged-in' && !isLoggedIn()) {
      router.replace('/login')
      return
    }
    if (requiredRole === 'admin' && !isAdmin()) {
      router.replace('/')
      return
    }
    setAuthorized(true)
  }, [router, requiredRole])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-[#868E96]">检查权限中...</div>
      </div>
    )
  }

  return <>{children}</>
}
