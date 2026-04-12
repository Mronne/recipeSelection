'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Clock, ChefHat } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Sidebar from '@/components/Sidebar'
import { useRecipes } from '@/hooks/useRecipes'
import { Recipe } from '@/types'
import { formatTime, getDifficultyLabel, getDifficultyColor } from '@/lib/utils'

const categories = ['全部', '中餐', '西餐', '甜点', '汤羹', '快手菜', '家常菜', '素食']

// 检查是否是游客
const isGuestUser = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('guest_mode') === 'true' || localStorage.getItem('user_role') === 'guest'
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [greeting, setGreeting] = useState('你好')
  const [isGuest, setIsGuest] = useState(false)
  
  const { recipes, isLoading, error, refetch } = useRecipes({
    search: searchQuery,
    categories: activeCategory !== '全部' ? [activeCategory] : undefined,
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
    
    setIsGuest(isGuestUser())
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      {/* Mobile: Add top padding for header */}
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="sticky top-16 lg:top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E9ECEF] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868E96]" />
                <input 
                  type="text" 
                  placeholder="搜索食谱..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 pl-12 pr-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] font-medium focus:border-[#4CAF50] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all"
                />
              </div>
            </div>
            
            {!isGuest && (
              <Link 
                href="/create" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] hover:shadow-lg transition-all whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>创建菜谱</span>
              </Link>
            )}
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Greeting */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">{greeting}，今天想做什么菜？</h1>
            <p className="text-[#868E96]">探索美味的中餐食谱，记录您的美食创作</p>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-[#4CAF50] text-white shadow-md'
                    : 'bg-white text-[#495057] border border-[#E9ECEF] hover:border-[#4CAF50] hover:text-[#4CAF50]'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
              {activeCategory === '全部' ? '全部食谱' : activeCategory}
            </h2>
            <span className="text-sm text-[#868E96]">
              {isLoading ? '加载中...' : `共 ${recipes.length} 个食谱`}
            </span>
          </motion.div>

          {/* Recipe Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-[#E9ECEF] animate-pulse">
                  <div className="aspect-[4/3] bg-[#F1F3F5] rounded-lg mb-4" />
                  <div className="h-5 bg-[#F1F3F5] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#F1F3F5] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-12 sm:py-16 bg-white rounded-xl border border-[#E9ECEF]"
            >
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-[#4CAF50]" />
              </div>
              <p className="text-[#495057] text-lg font-medium mb-2">
                {searchQuery || activeCategory !== '全部' 
                  ? '没有找到匹配的食谱' 
                  : '还没有食谱'}
              </p>
              <p className="text-[#868E96] mb-6">
                {searchQuery || activeCategory !== '全部'
                  ? '试试其他搜索词或筛选条件'
                  : '开始记录您的美食创作吧'}
              </p>
              {!searchQuery && activeCategory === '全部' && !isGuest && (
                <Link 
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  创建第一个菜谱
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

// Recipe Card Component
function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/recipe/${recipe.id}`}>
        <div className="group bg-white rounded-xl border border-[#E9ECEF] overflow-hidden hover:border-[#4CAF50] hover:shadow-lg transition-all duration-300 cursor-pointer">
          {/* Image Container - 移动端更小的高度 */}
          <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-[#F1F3F5] max-h-[180px] sm:max-h-none">
            <Image
              src={recipe.coverImage || '/images/recipe-placeholder.svg'}
              alt={recipe.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Difficulty Badge */}
            <div 
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: `${getDifficultyColor(recipe.difficulty)}20`,
                color: getDifficultyColor(recipe.difficulty)
              }}
            >
              {getDifficultyLabel(recipe.difficulty)}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-[#212529] mb-1 truncate group-hover:text-[#4CAF50] transition-colors">
              {recipe.name}
            </h3>
            <p className="text-sm text-[#868E96] line-clamp-2 mb-3 h-10">
              {recipe.description || '暂无描述'}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-[#868E96]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(recipe.prepTime + recipe.cookTime)}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#ADB5BD]" />
              <span>{recipe.servings}人份</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
