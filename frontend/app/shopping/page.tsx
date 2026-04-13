'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Check, Trash2, ShoppingBag, 
  ChefHat, Share2, Printer, ShieldAlert 
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getShoppingList, saveShoppingList, toggleShoppingItem, ShoppingItem, getMealPlans } from '@/lib/meal-plan'
import { isAdmin, isGuest, getCurrentUser, isLoggedIn } from '@/lib/auth'
import { useAuthGuard } from '@/hooks/useAuthGuard'

const CATEGORIES = ['肉类', '蔬菜', '水果', '主食', '调料', '其他']

export default function ShoppingPage() {
  return (
    <Suspense fallback={<ShoppingLoading />}>
      <ShoppingContent />
    </Suspense>
  )
}

function ShoppingLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen flex items-center justify-center">
        <div className="text-[#868E96]">加载中...</div>
      </main>
    </div>
  )
}

function ShoppingContent() {
  useAuthGuard('logged-in')
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [planName, setPlanName] = useState('购物清单')
  const [filter, setFilter] = useState<'all' | 'unchecked' | 'checked'>('all')
  const [hasPermission, setHasPermission] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    // 检查权限：所有登录用户（非游客）都可以查看购物清单
    const user = getCurrentUser()
    setUserRole(user?.role || '未知')
    setHasPermission(isLoggedIn())
    
    if (planId && isLoggedIn()) {
      const list = getShoppingList(planId)
      setItems(list)
      
      const plan = getMealPlans().find(p => p.id === planId)
      if (plan) setPlanName(`${plan.name} - 购物清单`)
    }
  }, [planId])

  // 无权限显示
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
          <header className="bg-white border-b border-[#E9ECEF] px-4 py-4">
            <Link href="/plan" className="flex items-center gap-2 text-[#495057] hover:text-[#212529]">
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </Link>
          </header>
          
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <ShieldAlert className="w-20 h-20 text-[#FF9800] mb-6" />
            <h1 className="text-2xl font-bold text-[#212529] mb-2">权限不足</h1>
            <p className="text-[#868E96] text-center max-w-md mb-6">
              当前身份：<span className="font-semibold text-[#495057]">{userRole === 'admin' ? '管理员' : userRole === 'user' ? '普通用户' : '游客'}</span>
            </p>
            <p className="text-[#868E96] text-center max-w-md mb-6">
              只有管理员可以查看购物清单。
              <br />
              普通用户和游客可以点菜，但不能生成购物清单。
            </p>
            <div className="flex gap-4">
              <Link
                href="/plan"
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047]"
              >
                返回点菜计划
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 border border-[#E9ECEF] text-[#495057] rounded-lg font-semibold hover:bg-[#F8F9FA]"
              >
                切换账号
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const toggleItem = (itemId: string) => {
    if (!planId) return
    toggleShoppingItem(planId, itemId)
    setItems(getShoppingList(planId))
  }

  const clearChecked = () => {
    if (!planId || !confirm('确定清空已购买的物品吗？')) return
    const updated = items.filter(item => !item.checked)
    saveShoppingList(planId, updated)
    setItems(updated)
  }

  const shareList = () => {
    const text = items.map(item => 
      `${item.checked ? '✓' : '○'} ${item.name} ${item.amount}${item.unit}`
    ).join('\n')
    
    if (navigator.share) {
      navigator.share({
        title: planName,
        text: text,
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('购物清单已复制到剪贴板')
    }
  }

  const filteredItems = items.filter(item => {
    if (filter === 'unchecked') return !item.checked
    if (filter === 'checked') return item.checked
    return true
  })

  const checkedCount = items.filter(i => i.checked).length
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0

  // 按分类分组
  const groupedItems = CATEGORIES.map(cat => ({
    category: cat,
    items: filteredItems.filter(item => item.category === cat),
  })).filter(group => group.items.length > 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="bg-white border-b border-[#E9ECEF] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/plan" className="p-2 hover:bg-[#F8F9FA] rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{planName}</h1>
                  <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#4CAF50] text-xs rounded-full">管理员</span>
                </div>
                <p className="text-sm text-[#868E96]">
                  {checkedCount}/{items.length} 已购买 ({Math.round(progress)}%)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={shareList}
                className="p-2 text-[#868E96] hover:text-[#4CAF50] hover:bg-[#E8F5E9] rounded-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 text-[#868E96] hover:text-[#4CAF50] hover:bg-[#E8F5E9] rounded-lg"
              >
                <Printer className="w-5 h-5" />
              </button>
              {checkedCount > 0 && (
                <button
                  onClick={clearChecked}
                  className="flex items-center gap-1 px-3 py-2 text-[#F44336] hover:bg-[#FFEBEE] rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  清空已购
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="h-1 bg-[#E9ECEF]">
          <div 
            className="h-full bg-[#4CAF50] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-[#E9ECEF]">
          {[
            { key: 'all', label: '全部' },
            { key: 'unchecked', label: '待购买' },
            { key: 'checked', label: '已购买' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === tab.key
                  ? 'bg-[#4CAF50] text-white'
                  : 'bg-white text-[#495057] border border-[#E9ECEF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-[#ADB5BD] mx-auto mb-4" />
              <p className="text-[#495057] text-lg font-medium mb-2">购物清单为空</p>
              <p className="text-[#868E96] mb-6">先去创建点菜计划吧</p>
              <Link
                href="/plan"
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold"
              >
                去点菜
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItems.map(({ category, items }) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden"
                >
                  <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E9ECEF]">
                    <h3 className="font-semibold text-[#495057]">{category}</h3>
                  </div>
                  <div className="divide-y divide-[#E9ECEF]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          item.checked ? 'bg-[#F8F9FA]' : 'bg-white'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.checked
                            ? 'bg-[#4CAF50] border-[#4CAF50]'
                            : 'border-[#DEE2E6]'
                        }`}>
                          {item.checked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${item.checked ? 'line-through text-[#ADB5BD]' : 'text-[#212529]'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-[#868E96]">
                            来自: {item.sourceRecipes.join(', ')}
                          </p>
                        </div>
                        <span className={`font-semibold ${item.checked ? 'text-[#ADB5BD]' : 'text-[#4CAF50]'}`}>
                          {item.amount}{item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
