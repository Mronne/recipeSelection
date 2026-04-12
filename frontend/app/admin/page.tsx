'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Users, Heart, ShoppingCart, ChefHat,
  ArrowLeft, Loader2
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { isAdmin, getCurrentUser, AuthUser } from '@/lib/auth'
import { useRecipes } from '@/hooks/useRecipes'
import { api } from '@/lib/api'

interface BackendUser {
  id: string
  username: string
  email?: string
  fullName?: string
  admin: boolean
  group?: string
  createdAt?: string
}

// 模拟收藏数据（实际应从后端获取）
const MOCK_FAVORITES: Record<string, string[]> = {
  'admin': ['红烧肉', '糖醋排骨', '宫保鸡丁'],
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'favorites'>('users')
  const { recipes } = useRecipes()
  
  // 用户列表状态
  const [users, setUsers] = useState<BackendUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsAuthorized(isAdmin())
    
    if (isAdmin()) {
      loadUsers()
    }
  }, [])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    setUsersError('')
    
    try {
      // 尝试从后端获取用户列表
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mealie_token') || ''}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Mealie API 返回的是分页格式
        const userList = data.items || data
        setUsers(userList.map((u: any) => ({
          id: u.id,
          username: u.username || u.fullName || 'Unknown',
          email: u.email,
          fullName: u.fullName,
          admin: u.admin || false,
          group: u.group,
          createdAt: u.createdAt,
        })))
      } else {
        // 如果API不可用，使用当前用户作为默认
        const currentUserData = getCurrentUser()
        setUsers([{
          id: currentUserData?.id || '1',
          username: currentUserData?.username || 'Admin',
          email: currentUserData?.email,
          admin: true,
        }])
        setUsersError('无法获取完整用户列表，仅显示当前用户')
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      // 使用默认数据
      const currentUserData = getCurrentUser()
      setUsers([{
        id: currentUserData?.id || '1',
        username: currentUserData?.username || 'Admin',
        email: currentUserData?.email,
        admin: true,
      }])
      setUsersError('后端连接失败，仅显示当前用户')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="lg:ml-60 min-h-screen flex flex-col items-center justify-center p-8">
          <Shield className="w-20 h-20 text-[#F44336] mb-6" />
          <h1 className="text-2xl font-bold text-[#212529] mb-2">访问被拒绝</h1>
          <p className="text-[#868E96] text-center max-w-md mb-6">
            此页面仅管理员可访问
          </p>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold">
              返回首页
            </Link>
            <Link href="/login" className="px-6 py-3 border border-[#E9ECEF] text-[#495057] rounded-lg font-semibold">
              切换账号
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="bg-white border-b border-[#E9ECEF] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-[#F8F9FA] rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Shield className="w-6 h-6 text-[#4CAF50]" />
              <h1 className="text-xl font-bold">管理员控制台</h1>
            </div>
            <span className="px-3 py-1.5 bg-[#E8F5E9] text-[#4CAF50] rounded-full text-sm">
              管理员：{currentUser?.username}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <StatCard icon={Users} label="总用户" value={users.length} color="bg-blue-500" />
          <StatCard icon={Heart} label="总收藏" value={Object.values(MOCK_FAVORITES).flat().length} color="bg-red-500" />
          <StatCard icon={ShoppingCart} label="购物清单" value={3} color="bg-orange-500" />
          <StatCard icon={ChefHat} label="菜谱总数" value={recipes.length} color="bg-green-500" />
        </div>

        <div className="flex gap-2 px-4 border-b border-[#E9ECEF]">
          {[
            { key: 'users', label: '用户管理', icon: Users },
            { key: 'favorites', label: '用户收藏', icon: Heart },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#4CAF50] text-[#4CAF50]'
                    : 'border-transparent text-[#868E96]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-4">
          {activeTab === 'users' && <UsersTab users={users} isLoading={isLoadingUsers} error={usersError} />}
          {activeTab === 'favorites' && <FavoritesTab users={users} />}
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-[#E9ECEF] p-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-[#868E96]">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface UsersTabProps {
  users: BackendUser[]
  isLoading: boolean
  error: string
}

function UsersTab({ users, isLoading, error }: UsersTabProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E9ECEF] p-12">
        <div className="flex items-center justify-center gap-3 text-[#868E96]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>加载用户列表...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E9ECEF]">
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E9ECEF] flex items-center justify-between">
        <h3 className="font-semibold">用户列表</h3>
        {error && <span className="text-xs text-[#F44336]">{error}</span>}
      </div>
      {users.length === 0 ? (
        <div className="p-8 text-center text-[#868E96]">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无用户数据</p>
        </div>
      ) : (
        users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 border-b border-[#E9ECEF] last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                <span className="text-[#4CAF50] font-bold">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-[#868E96]">{user.email || '无邮箱'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.group && (
                <span className="text-xs text-[#868E96] bg-[#F1F3F5] px-2 py-1 rounded">
                  {user.group}
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.admin 
                  ? 'bg-[#FFEBEE] text-[#F44336]' 
                  : 'bg-[#E3F2FD] text-[#1976D2]'
              }`}>
                {user.admin ? '管理员' : '普通用户'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface FavoritesTabProps {
  users: BackendUser[]
}

function FavoritesTab({ users }: FavoritesTabProps) {
  return (
    <div className="space-y-4">
      {users.filter(u => !u.admin).length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 text-center">
          <Heart className="w-12 h-12 mx-auto mb-3 text-[#868E96] opacity-50" />
          <p className="text-[#868E96]">暂无普通用户收藏数据</p>
        </div>
      ) : (
        users.filter(u => !u.admin).map(user => (
          <div key={user.id} className="bg-white rounded-xl border border-[#E9ECEF] p-4">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-[#F44336]" />
              <p className="font-bold">{user.username}的收藏</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(MOCK_FAVORITES[user.id] || MOCK_FAVORITES['admin'] || []).map((recipe, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-[#F8F9FA] text-[#495057] rounded-full text-sm">
                  {recipe}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
