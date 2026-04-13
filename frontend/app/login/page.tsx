'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, Crown, User, UserPlus } from 'lucide-react'
import { setCurrentUser, setToken, clearToken, createGuestUser, fetchCurrentUser } from '@/lib/auth'
import Logo from '@/components/Logo'

type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<AuthMode>('login')
  const [isGuestMode, setIsGuestMode] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })

  const redirectToHome = () => {
    window.location.href = '/'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (isGuestMode) {
      guestMode()
      return
    }

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致')
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            password_confirm: formData.password,
            email: `${formData.username}@example.com`,
            full_name: formData.username,
            group: 'Home',
            locale: 'zh-CN',
          }),
        })

        if (res.ok) {
          // 注册成功后调用登录接口获取真正的 access_token
          const loginBody = new URLSearchParams()
          loginBody.append('username', formData.username)
          loginBody.append('password', formData.password)
          const loginRes = await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loginBody,
          })
          if (loginRes.ok) {
            const loginData = await loginRes.json()
            setToken(loginData.access_token)
            // 获取后端真实用户角色
            const user = await fetchCurrentUser()
            if (user) {
              setCurrentUser(user)
              localStorage.setItem('user_role', user.role)
            } else {
              setError('获取用户信息失败')
              setIsLoading(false)
              return
            }
          } else {
            setError('自动登录失败，请手动登录')
            setIsLoading(false)
            return
          }
          redirectToHome()
        } else {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const err = await res.json()
            setError(typeof err.detail === 'string' ? err.detail : JSON.stringify(err))
          } else {
            const text = await res.text()
            setError(`服务器错误 (${res.status}): ${text.substring(0, 100)}`)
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('Unexpected token')) {
          setError('后端服务未启动或 API 路径错误，请检查后端是否运行')
        } else {
          setError(err?.message || '网络错误，请检查网络连接')
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      // 登录逻辑
      try {
        const formBody = new URLSearchParams()
        formBody.append('username', formData.username)
        formBody.append('password', formData.password)

        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
        })

        if (res.ok) {
          const data = await res.json()
          setToken(data.access_token)
          
          // 获取后端真实用户角色
          const user = await fetchCurrentUser()
          if (user) {
            setCurrentUser(user)
            localStorage.setItem('user_role', user.role)
          } else {
            setError('获取用户信息失败')
            setIsLoading(false)
            return
          }
          
          redirectToHome()
        } else {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const err = await res.json()
            setError(typeof err.detail === 'string' ? err.detail : JSON.stringify(err))
          } else {
            const text = await res.text()
            setError(`服务器错误 (${res.status}): ${text.substring(0, 100)}`)
          }
        }
      } catch (err: any) {
        setError(err?.message || '网络错误，请检查后端服务')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const guestMode = () => {
    const guest = createGuestUser()
    setCurrentUser(guest)
    clearToken()
    localStorage.setItem('guest_mode', 'true')
    localStorage.setItem('user_role', 'guest')
    redirectToHome()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-8 py-6 flex justify-center">
        <Logo width={240} height={72} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 sm:p-8 shadow-sm">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => { setIsGuestMode(false); setMode('login') }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  !isGuestMode
                    ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#4CAF50]'
                    : 'border-[#E9ECEF] text-[#868E96] hover:border-[#4CAF50]/50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">登录 / 注册</span>
              </button>
              <button
                onClick={() => setIsGuestMode(true)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  isGuestMode
                    ? 'border-[#868E96] bg-[#F5F5F5] text-[#616161]'
                    : 'border-[#E9ECEF] text-[#868E96] hover:border-[#868E96]/50'
                }`}
              >
                <Crown className="w-5 h-5" />
                <span className="text-xs font-medium">游客访问</span>
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#212529] mb-2">
                {isGuestMode ? '游客访问' : mode === 'login' ? '欢迎回来' : '创建账号'}
              </h1>
              <p className="text-[#868E96] text-sm">
                {isGuestMode 
                  ? '游客只能浏览，不能创建或收藏菜谱' 
                  : mode === 'login' 
                    ? '登录您的账号' 
                    : '注册成为新用户'}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg text-[#C62828] text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login/Register Form */}
            {!isGuestMode && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="请输入用户名"
                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="请输入密码"
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#868E96] hover:text-[#495057] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password for Register */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-semibold text-[#212529] mb-2">
                        确认密码
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="请再次输入密码"
                        className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none transition-all"
                        required={mode === 'register'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === 'login' ? '登录中...' : '注册中...'}
                    </>
                  ) : mode === 'login' ? (
                    '登录'
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      注册
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Guest Mode Button */}
            {isGuestMode && (
              <button
                onClick={guestMode}
                className="w-full py-3.5 bg-[#868E96] text-white rounded-lg font-semibold hover:bg-[#757575] transition-colors flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                进入游客模式
              </button>
            )}

            {/* Toggle Login/Register */}
            {!isGuestMode && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setError('')
                  }}
                  className="text-[#4CAF50] hover:underline text-sm"
                >
                  {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-white rounded-xl border border-[#E9ECEF] p-4"
          >
            <p className="text-sm font-semibold text-[#495057] mb-2">权限说明：</p>
            <div className="text-xs text-[#868E96] space-y-1">
              <p>• 管理员：查看所有收藏、生成购物清单、管理所有菜谱</p>
              <p>• 普通用户：创建菜谱、收藏、点菜、生成购物清单</p>
              <p>• 游客：仅浏览菜谱（不能创建、不能收藏、不能购物）</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
