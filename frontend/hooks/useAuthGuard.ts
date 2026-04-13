'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin, isLoggedIn } from '@/lib/auth'

export function useAuthGuard(requiredRole: 'logged-in' | 'admin' = 'logged-in') {
  const router = useRouter()

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
  }, [router, requiredRole])
}
