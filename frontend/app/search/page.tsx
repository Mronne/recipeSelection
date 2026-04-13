'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, ChefHat } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Sidebar from '@/components/Sidebar'
import { useRecipes } from '@/hooks/useRecipes'
import { formatTime, getDifficultyLabel, getDifficultyColor } from '@/lib/utils'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { recipes, isLoading } = useRecipes({ search: searchQuery })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="sticky top-16 lg:top-0 z-30 bg-white border-b border-[#E9ECEF] px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868E96]" />
              <input
                type="text"
                placeholder="搜索食谱、食材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
                autoFocus
              />
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          {searchQuery && (
            <h2 className="text-lg font-bold mb-4">
              {isLoading ? '搜索中...' : `找到 ${recipes.length} 个结果`}
            </h2>
          )}
          
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/recipe/detail?id=${recipe.id}`}>
                    <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden hover:border-[#4CAF50]">
                      {/* 图片区域 - 移动端更小的高度 */}
                      <div className="relative aspect-[16/9] sm:aspect-[4/3] bg-[#F1F3F5] overflow-hidden max-h-[160px] sm:max-h-none">
                        {recipe.coverImage ? (
                          <Image
                            src={recipe.coverImage}
                            alt={recipe.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ChefHat className="w-12 h-12 text-[#ADB5BD]" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `${getDifficultyColor(recipe.difficulty)}20`, color: getDifficultyColor(recipe.difficulty) }}>
                          {getDifficultyLabel(recipe.difficulty)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1">{recipe.name}</h3>
                        <p className="text-sm text-[#868E96] line-clamp-1 mb-2">{recipe.description || '暂无描述'}</p>
                        <div className="flex items-center gap-2 text-xs text-[#868E96]">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(recipe.prepTime + recipe.cookTime)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-[#868E96]">没有找到相关食谱</div>
          ) : (
            <div className="text-center py-12 text-[#868E96]">输入关键词开始搜索</div>
          )}
        </div>
      </main>
    </div>
  )
}
