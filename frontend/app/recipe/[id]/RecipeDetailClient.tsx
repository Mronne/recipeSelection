'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  Edit2, 
  Trash2, 
  ChefHat,
  Play,
  Pause,
  Check
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useRecipe } from '@/hooks/useRecipes'
import { useFavorites } from '@/hooks/useFavorites'
import { formatTime, getDifficultyLabel, getDifficultyColor } from '@/lib/utils'

export default function RecipeDetailClient() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  
  const { recipe, isLoading, error, remove } = useRecipe(recipeId)
  const { isFavorite, toggleFavorite, canUseFavorites } = useFavorites()
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (recipeId && canUseFavorites) {
      setIsFav(isFavorite(recipeId))
    }
  }, [recipeId, isFavorite, canUseFavorites])

  const handleToggleFavorite = async () => {
    if (!recipeId) return
    if (!canUseFavorites) {
      alert('游客无法收藏菜谱，请登录普通用户或管理员账号')
      return
    }
    const result = await toggleFavorite(recipeId)
    if (result !== null) {
      setIsFav(result)
    }
  }

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(id)) newChecked.delete(id)
    else newChecked.add(id)
    setCheckedIngredients(newChecked)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个菜谱吗？')) return
    const result = await remove()
    if (result.success) router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="ml-60 min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#868E96]">
            <div className="w-6 h-6 border-2 border-[#4CAF50]/30 border-t-[#4CAF50] rounded-full animate-spin" />
            加载中...
          </div>
        </main>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="ml-60 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F1F3F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-[#ADB5BD]" />
            </div>
            <p className="text-[#495057] text-lg font-medium mb-2">{error || '菜谱不存在'}</p>
            <Link href="/" className="text-[#4CAF50] hover:underline font-medium">
              返回首页
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
        {/* Header */}
        <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-[#E9ECEF] px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-[#495057] hover:text-[#212529] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">返回</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleFavorite}
                disabled={!canUseFavorites}
                className={`p-2 transition-colors rounded-lg ${
                  isFav 
                    ? 'text-[#F44336] bg-[#FFEBEE]' 
                    : canUseFavorites
                      ? 'text-[#868E96] hover:text-[#F44336] hover:bg-[#F8F9FA]'
                      : 'text-[#ADB5BD] cursor-not-allowed'
                }`}
                title={canUseFavorites ? (isFav ? '取消收藏' : '收藏') : '游客无法收藏'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-[#868E96] hover:text-[#212529] transition-colors rounded-lg hover:bg-[#F8F9FA]">
                <Share2 className="w-5 h-5" />
              </button>
              <Link 
                href={`/recipe/${recipeId}/edit`}
                className="p-2 text-[#868E96] hover:text-[#212529] transition-colors rounded-lg hover:bg-[#F8F9FA]"
              >
                <Edit2 className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleDelete}
                className="p-2 text-[#868E96] hover:text-[#F44336] transition-colors rounded-lg hover:bg-[#F8F9FA]"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden mb-8">
            <div className="flex flex-col lg:flex-row">
              {/* Image - 移动端限制最大高度 */}
              <div className="relative w-full lg:w-[400px] h-[200px] sm:h-[250px] lg:h-[400px] flex-shrink-0 bg-[#F1F3F5]">
                <Image
                  src={recipe.coverImage || '/images/recipe-placeholder.svg'}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category & Difficulty */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#388E3C] rounded-full text-sm font-semibold">
                      {recipe.category}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: `${getDifficultyColor(recipe.difficulty)}15`,
                        color: getDifficultyColor(recipe.difficulty)
                      }}
                    >
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
                    {recipe.name}
                  </h1>
                  
                  <p className="text-[#495057] text-lg mb-6 leading-relaxed">
                    {recipe.description || '暂无描述'}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-[#868E96]">
                      <Clock className="w-5 h-5" />
                      <span>准备 {formatTime(recipe.prepTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#868E96]">
                      <ChefHat className="w-5 h-5" />
                      <span>烹饪 {formatTime(recipe.cookTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#868E96]">
                      <Users className="w-5 h-5" />
                      <span>{recipe.servings} 人份</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#F1F3F5] text-[#495057] rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ingredients */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E9ECEF] p-6"
            >
              <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-[#4CAF50]" />
                </div>
                食材清单
                <span className="text-sm font-normal text-[#868E96]">
                  ({checkedIngredients.size}/{recipe.ingredients.length})
                </span>
              </h2>

              <div className="space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <label
                    key={ingredient.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F8F9FA] cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="w-5 h-5 rounded border-[#DEE2E6] text-[#4CAF50] focus:ring-[#4CAF50] focus:ring-offset-0"
                    />
                    <span className={`flex-1 font-medium transition-all ${
                      checkedIngredients.has(ingredient.id) 
                        ? 'line-through text-[#ADB5BD]' 
                        : 'text-[#212529]'
                    }`}>
                      {ingredient.name}
                    </span>
                    <span className={`text-sm ${
                      checkedIngredients.has(ingredient.id) 
                        ? 'text-[#ADB5BD]' 
                        : 'text-[#868E96]'
                    }`}>
                      {ingredient.amount}{ingredient.unit}
                    </span>
                  </label>
                ))}
              </div>

              {checkedIngredients.size === recipe.ingredients.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-[#E8F5E9] rounded-lg flex items-center gap-2 text-[#388E3C]"
                >
                  <Check className="w-5 h-5" />
                  <span className="font-medium">食材已备齐！</span>
                </motion.div>
              )}
            </motion.section>

            {/* Steps */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#E9ECEF] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#212529] flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-[#4CAF50]" />
                  </div>
                  烹饪步骤
                </h2>
                
                {/* Cooking Mode Toggle */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isPlaying 
                      ? 'bg-[#4CAF50] text-white' 
                      : 'bg-[#F1F3F5] text-[#495057] hover:bg-[#E9ECEF]'
                  }`}
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4" /> 退出模式</>
                  ) : (
                    <><Play className="w-4 h-4" /> 烹饪模式</>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => isPlaying && setCurrentStep(index)}
                    className={`flex gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                      isPlaying && currentStep === index 
                        ? 'bg-[#E8F5E9] border-2 border-[#4CAF50]' 
                        : 'bg-[#F8F9FA] hover:bg-[#F1F3F5]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      isPlaying && currentStep === index 
                        ? 'bg-[#4CAF50] text-white' 
                        : 'bg-white text-[#495057] border border-[#E9ECEF]'
                    }`}>
                      {step.order}
                    </div>
                    <p className={`flex-1 leading-relaxed pt-2 ${
                      isPlaying && currentStep === index 
                        ? 'text-[#212529] font-medium' 
                        : 'text-[#495057]'
                    }`}>
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Cooking Mode Controls */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-between p-4 bg-[#212529] rounded-xl text-white"
                >
                  <span className="font-medium">
                    步骤 {currentStep + 1} / {recipe.steps.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="px-4 py-2 bg-[#3e3e3e] rounded-lg disabled:opacity-50"
                    >
                      上一步
                    </button>
                    <button
                      onClick={() => setCurrentStep(Math.min(recipe.steps.length - 1, currentStep + 1))}
                      disabled={currentStep === recipe.steps.length - 1}
                      className="px-4 py-2 bg-[#4CAF50] text-black rounded-lg font-medium disabled:opacity-50"
                    >
                      下一步
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  )
}
