'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  PlusCircle, 
  Calendar, 
  ShoppingCart, 
  Settings, 
  ChefHat,
  BookOpen,
  LogOut,
  Menu,
  X,
  Shield,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { isAdmin } from '@/lib/auth'
import Logo from './Logo'

const navItems = [
  { icon: Home, label: '首页', href: '/' },
  { icon: Search, label: '搜索', href: '/search' },
]

const libraryItems = [
  { icon: BookOpen, label: '我的食谱', href: '/library' },
  { icon: PlusCircle, label: '创建菜谱', href: '/create' },
  { icon: Calendar, label: '膳食计划', href: '/plan' },
  { icon: ShoppingCart, label: '购物清单', href: '/shopping' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isGuestUser, setIsGuestUser] = useState(false)

  useEffect(() => {
    setIsAdminUser(isAdmin())
    // 检查是否是游客
    const isGuest = localStorage.getItem('guest_mode') === 'true' || localStorage.getItem('user_role') === 'guest'
    setIsGuestUser(isGuest)
  }, [])
  
  // 根据用户角色过滤菜单项
  const filteredLibraryItems = libraryItems.filter(item => {
    // 游客不能创建菜谱
    if (isGuestUser && item.href === '/create') return false
    return true
  })

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[#E9ECEF]">
        <Link href="/" className="flex justify-center">
          <Logo width={160} height={48} />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm relative",
                isActive 
                  ? "bg-[#E8F5E9] text-[#388E3C]" 
                  : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-[3px] h-6 bg-[#4CAF50] rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "stroke-[2.5px]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2 h-px bg-[#E9ECEF]" />

      {/* Admin Section - Only for admins */}
      {isAdminUser && (
        <>
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-[#868E96] uppercase tracking-wider">管理</span>
          </div>
          <nav className="p-3 space-y-1">
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm relative",
                pathname === '/admin' 
                  ? "bg-[#FFEBEE] text-[#F44336]" 
                  : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]"
              )}
            >
              {pathname === '/admin' && (
                <div className="absolute left-0 w-[3px] h-6 bg-[#F44336] rounded-r-full" />
              )}
              <Shield className={cn("w-5 h-5 flex-shrink-0", pathname === '/admin' && "stroke-[2.5px]")} />
              <span>管理员控制台</span>
            </Link>
          </nav>
          <div className="mx-4 my-2 h-px bg-[#E9ECEF]" />
        </>
      )}

      {/* Library Section */}
      <div className="px-4 py-2">
        <span className="text-xs font-semibold text-[#868E96] uppercase tracking-wider">我的库</span>
      </div>
      
      <nav className="p-3 space-y-1 flex-1">
        {filteredLibraryItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm relative",
                isActive 
                  ? "bg-[#E8F5E9] text-[#388E3C]" 
                  : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-[3px] h-6 bg-[#4CAF50] rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "stroke-[2.5px]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#E9ECEF] space-y-1">
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm",
            pathname === '/settings' 
              ? "bg-[#E8F5E9] text-[#388E3C]" 
              : "text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>设置</span>
        </Link>
        
        <button 
          onClick={() => {
            clearToken()
            localStorage.removeItem('demo_mode')
            localStorage.removeItem('guest_mode')
            localStorage.removeItem('current_user')
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm text-[#495057] hover:bg-[#F8F9FA] hover:text-[#F44336]"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>退出登录</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E9ECEF] z-50 flex items-center justify-between px-4">
        {pathname === '/create' ? (
          // 创建页面：显示标题而不是 logo
          <h1 className="text-lg font-bold text-[#212529]">创建菜谱</h1>
        ) : (
          // 其他页面：显示 logo
          <Link href="/" className="flex items-center">
            <Logo width={120} height={36} />
          </Link>
        )}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-[#F8F9FA] rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-16 bottom-0 w-[280px] bg-white z-50 flex flex-col overflow-y-auto"
          >
            <NavContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E9ECEF] z-50 flex-col">
        <NavContent />
      </aside>
    </>
  )
}
