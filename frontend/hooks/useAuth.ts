'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { demoApi, isDemoMode } from '@/lib/api-demo'
import { clearToken } from '@/lib/auth'
import type { User, LoginCredentials } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初始化时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('mealie_token')
    const demo = localStorage.getItem('demo_mode')
    
    if (demo === 'true') {
      // 演示模式
      demoApi.getCurrentUser().then(setUser)
      setIsAuthenticated(true)
      setIsLoading(false)
    } else if (token) {
      // 正常模式，验证token
      api.loadToken()
      api.getCurrentUser()
        .then((u) => {
          setUser(u)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // 获取用户信息失败时不自动清除token，避免网络抖动导致被登出
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      await api.login(credentials)
      const user = await api.getCurrentUser()
      setUser(user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '登录失败' 
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    clearToken()
    localStorage.removeItem('demo_mode')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}
