'use client'

import { motion } from 'framer-motion'
import { Clock, ChefHat, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useRecipes } from '@/hooks/useRecipes'
import { formatTime, getDifficultyLabel, getDifficultyColor } from '@/lib/utils'

export default function LibraryPage() {
  const { recipes, isLoading } = useRecipes()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="sticky top-16 lg:top-0 z-30 bg-white border-b border-[#E9ECEF] px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">我的食谱</h1>
            <Link href="/create" className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" />
              新建
            </Link>
          </div>
        </header>

        <div className="px-4 py-6">
          {isLoading ? (
            <div className="text-center py-12 text-[#868E96]">加载中...</div>
          ) : recipes.length > 0 ? (
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
                      <div className="relative aspect-[4/3] bg-[#F1F3F5] overflow-hidden">
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
          ) : (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-[#ADB5BD] mx-auto mb-4" />
              <p className="text-[#868E96] mb-4">还没有创建食谱</p>
              <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold">
                <Plus className="w-5 h-5" />
                创建第一个食谱
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
