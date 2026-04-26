'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Check, 
  ChefHat, 
  Clock, 
  Users, 
  Camera, 
  Plus, 
  X, 
  GripVertical,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useCreateRecipe } from '@/hooks/useRecipes'
import { api } from '@/lib/api'
import { RecipeCreate } from '@/types'
import { ALL_INGREDIENTS, UNITS } from '@/lib/ingredients-data'
import { getAllCategories } from '@/lib/categories-data'
import { parseRecipeText } from '@/lib/recipe-parser'
import ImageUploader from '@/components/ImageUploader'
import { Sparkles, Wand2 } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'

const DIFFICULTIES = [
  { value: 'easy', label: '简单', color: '#4CAF50' },
  { value: 'medium', label: '中等', color: '#FF9800' },
  { value: 'hard', label: '困难', color: '#F44336' },
]

const STEPS = ['基本信息', '食材准备', '烹饪步骤']

// 检查是否是游客
const isGuestUser = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('guest_mode') === 'true' || localStorage.getItem('user_role') === 'guest'
}

export default function CreateRecipe() {
  useAuthGuard('logged-in')
  const router = useRouter()
  const { create, isLoading } = useCreateRecipe()
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  
  useEffect(() => {
    // 检查是否是游客，游客不能创建菜谱
    if (isGuestUser()) {
      setIsGuest(true)
    }
  }, [])
  
  const [recipe, setRecipe] = useState<RecipeCreate>({
    name: '',
    description: '',
    coverImage: '',
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    difficulty: 'easy',
    ingredients: [],
    steps: [],
    tags: [],
    category: '中餐',
  })
  
  // 存储实际的图片文件，用于后续上传
  const [imageFile, setImageFile] = useState<File | null>(null)

  const updateRecipe = (updates: Partial<RecipeCreate>) => {
    setRecipe(prev => ({ ...prev, ...updates }))
  }

  const [error, setError] = useState<string>('')

  const handleSubmit = async () => {
    setError('')
    
    const result = await create(recipe)
    
    if (result.success && result.recipe) {
      const recipeSlug = result.recipe.slug
      
      // 如果有图片文件，上传图片
      if (imageFile && recipeSlug) {
        try {
          const uploadResult = await api.uploadRecipeImage(recipeSlug, imageFile)
          console.log('图片上传成功', uploadResult)
        } catch (err: any) {
          console.error('图片上传失败', err)
          setError(`菜谱已创建，但图片上传失败：${err?.displayMessage || err?.message || '未知错误'}`)
          // 不立即跳转，让用户看到错误
          return
        }
      }
      
      setShowSuccess(true)
      setTimeout(() => router.push('/'), 1500)
    } else {
      setError(result.error || '创建失败，请重试')
    }
  }

  const canProceed = () => {
    if (currentStep === 0) return recipe.name.trim().length > 0
    if (currentStep === 1) return recipe.ingredients.length > 0
    if (currentStep === 2) return recipe.steps.length > 0
    return true
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#212529] mb-2">创建成功！</h2>
          <p className="text-[#868E96]">您的菜谱已保存到食谱集</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      {/* 游客访问限制提示 */}
      {isGuest && (
        <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#F44336]" />
            </div>
            <h1 className="text-2xl font-bold text-[#212529] mb-3">游客无法创建菜谱</h1>
            <p className="text-[#868E96] mb-6">
              游客只能浏览菜谱，如需创建菜谱，请注册成为普通用户或管理员。
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/" 
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors"
              >
                返回首页
              </Link>
              <Link 
                href="/login" 
                className="px-6 py-3 border border-[#E9ECEF] text-[#495057] rounded-lg font-semibold hover:bg-[#F8F9FA] transition-colors"
              >
                去登录
              </Link>
            </div>
          </div>
        </main>
      )}
      
      {!isGuest && (
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-[#E9ECEF] px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-[#495057]" />
              </Link>
              <h1 className="text-2xl font-bold text-[#212529]">创建菜谱</h1>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        <div className="bg-white border-b border-[#E9ECEF] px-4 sm:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        index < currentStep 
                          ? 'bg-[#4CAF50] text-white'
                          : index === currentStep
                          ? 'bg-[#4CAF50] text-white ring-4 ring-[#E8F5E9]'
                          : 'bg-[#F1F3F5] text-[#868E96]'
                      }`}
                    >
                      {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      index <= currentStep ? 'text-[#4CAF50]' : 'text-[#868E96]'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                      index < currentStep ? 'bg-[#4CAF50]' : 'bg-[#E9ECEF]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <Step1BasicInfo 
                  key="step1"
                  recipe={recipe} 
                  updateRecipe={updateRecipe}
                  onImageSelect={setImageFile}
                />
              )}
              {currentStep === 1 && (
                <Step2Ingredients 
                  key="step2"
                  recipe={recipe} 
                  updateRecipe={updateRecipe} 
                />
              )}
              {currentStep === 2 && (
                <Step3Steps 
                  key="step3"
                  recipe={recipe} 
                  updateRecipe={updateRecipe}
                />
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#E9ECEF] text-[#495057] rounded-lg font-semibold hover:bg-[#F8F9FA] transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  上一步
                </button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      完成创建
                    </>
                  )}
                </button>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg text-[#C62828] text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  )
}

// Step 1: Basic Info
function Step1BasicInfo({ 
  recipe, 
  updateRecipe,
  onImageSelect
}: { 
  recipe: RecipeCreate
  updateRecipe: (u: Partial<RecipeCreate>) => void
  onImageSelect: (file: File | null) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-[#212529] mb-6">基本信息</h2>
      
      {/* Image Upload */}
      <div className="max-w-xs mx-auto mb-6">
        <ImageUploader 
          value={recipe.coverImage}
          onChange={(url, file) => {
            console.log('Step1BasicInfo: onChange', url, file?.name, file?.size)
            updateRecipe({ coverImage: url })
            onImageSelect(file || null)
            console.log('Step1BasicInfo: imageFile 已更新')
          }}
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          菜谱名称 <span className="text-[#F44336]">*</span>
        </label>
        <input
          type="text"
          value={recipe.name}
          onChange={(e) => updateRecipe({ name: e.target.value })}
          placeholder="例如：红烧肉"
          className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">描述</label>
        <textarea
          value={recipe.description}
          onChange={(e) => updateRecipe({ description: e.target.value })}
          placeholder="简单描述这道菜的特点和口味..."
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">分类</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {getAllCategories().map((cat) => (
            <button
              key={cat}
              onClick={() => updateRecipe({ category: cat })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                recipe.category === cat
                  ? 'bg-[#4CAF50] text-white'
                  : 'bg-[#F1F3F5] text-[#495057] hover:bg-[#E9ECEF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Time & Servings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-2">准备时间(分)</label>
          <input
            type="number"
            value={recipe.prepTime}
            onChange={(e) => updateRecipe({ prepTime: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] focus:border-[#4CAF50] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-2">烹饪时间(分)</label>
          <input
            type="number"
            value={recipe.cookTime}
            onChange={(e) => updateRecipe({ cookTime: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] focus:border-[#4CAF50] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-2">份量(人)</label>
          <input
            type="number"
            value={recipe.servings}
            onChange={(e) => updateRecipe({ servings: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] focus:border-[#4CAF50] outline-none"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">难度</label>
        <div className="flex gap-3">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => updateRecipe({ difficulty: diff.value as any })}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                recipe.difficulty === diff.value
                  ? 'text-white'
                  : 'bg-[#F1F3F5] text-[#495057] hover:bg-[#E9ECEF]'
              }`}
              style={{ 
                backgroundColor: recipe.difficulty === diff.value ? diff.color : undefined 
              }}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Step 2: Ingredients
function Step2Ingredients({ 
  recipe, 
  updateRecipe 
}: { 
  recipe: RecipeCreate
  updateRecipe: (u: Partial<RecipeCreate>) => void
}) {
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '克' })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [parseText, setParseText] = useState('')
  const [showParser, setShowParser] = useState(false)

  const handleAdd = () => {
    if (newIngredient.name && newIngredient.amount) {
      updateRecipe({
        ingredients: [...recipe.ingredients, {
          name: newIngredient.name,
          amount: parseFloat(newIngredient.amount) || 0,
          unit: newIngredient.unit,
          category: 'other',
        }]
      })
      setNewIngredient({ name: '', amount: '', unit: '克' })
      setShowSuggestions(false)
    }
  }

  const removeIngredient = (index: number) => {
    updateRecipe({ ingredients: recipe.ingredients.filter((_, i) => i !== index) })
  }

  const handleNameChange = (value: string) => {
    setNewIngredient({ ...newIngredient, name: value })
    if (value.length > 0) {
      const matches = ALL_INGREDIENTS.filter(i => i.includes(value)).slice(0, 5)
      setSuggestions(matches)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // 智能解析食谱文本
  const handleParseRecipe = async () => {
    if (!parseText.trim()) return

    try {
      const parsed = await parseRecipeText(parseText)

      // 添加解析出的食材
      if (parsed.ingredients && parsed.ingredients.length > 0) {
        const newIngredients = parsed.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: 'other' as const,
        }))
        updateRecipe({
          ingredients: [...recipe.ingredients, ...newIngredients]
        })
      }

      // 添加解析出的步骤
      if (parsed.steps && parsed.steps.length > 0) {
        const newSteps = parsed.steps.map(step => ({
          order: step.order,
          description: step.description,
        }))
        updateRecipe({
          steps: [...recipe.steps, ...newSteps]
        })
      }

      // 如果解析出了菜名，更新菜名
      if (parsed.name) {
        updateRecipe({ name: parsed.name })
      }

      // 如果解析出了描述，更新描述
      if (parsed.description) {
        updateRecipe({ description: parsed.description })
      }

      // 如果解析出了时间和份量，更新
      if (parsed.prepTime !== undefined) {
        updateRecipe({ prepTime: parsed.prepTime })
      }
      if (parsed.cookTime !== undefined) {
        updateRecipe({ cookTime: parsed.cookTime })
      }
      if (parsed.servings !== undefined) {
        updateRecipe({ servings: parsed.servings })
      }

      setParseText('')
      setShowParser(false)
      alert(`成功解析！已添加 ${parsed.ingredients?.length || 0} 个食材，${parsed.steps?.length || 0} 个步骤`)
    } catch (err) {
      alert('解析失败，请检查网络连接或稍后重试')
      console.error('Parse recipe failed:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#212529]">食材准备</h2>
        <button
          onClick={() => setShowParser(!showParser)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E8F5E9] text-[#4CAF50] rounded-lg hover:bg-[#C8E6C9] transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          智能解析
        </button>
      </div>

      {/* 智能解析面板 */}
      {showParser && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] border border-[#4CAF50]/30 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-[#388E3C]">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">粘贴食谱文本，自动提取食材和步骤</span>
          </div>
          <textarea
            value={parseText}
            onChange={(e) => setParseText(e.target.value)}
            placeholder="粘贴食谱内容，例如：&#10;食材：&#10;猪肉 500克&#10;青椒 2个&#10;步骤：&#10;1. 猪肉切片&#10;2. 青椒切丝..."
            rows={6}
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleParseRecipe}
              disabled={!parseText.trim()}
              className="flex-1 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50"
            >
              开始解析
            </button>
            <button
              onClick={() => setShowParser(false)}
              className="px-4 py-2 border border-[#E9ECEF] text-[#495057] rounded-lg hover:bg-white transition-colors"
            >
              取消
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Ingredient */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-4 space-y-4">
        <div className="relative">
          <label className="block text-sm font-semibold text-[#212529] mb-2">食材名称</label>
          <input
            type="text"
            value={newIngredient.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="输入食材名称..."
            className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none"
          />
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E9ECEF] rounded-lg shadow-lg z-10 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setNewIngredient({ ...newIngredient, name: s })
                    setShowSuggestions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-[#212529] mb-2">数量</label>
            <input
              type="number"
              value={newIngredient.amount}
              onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] focus:border-[#4CAF50] outline-none"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-semibold text-[#212529] mb-2">单位</label>
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] focus:border-[#4CAF50] outline-none"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!newIngredient.name || !newIngredient.amount}
          className="w-full py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加食材
        </button>
      </div>

      {/* Ingredient List */}
      {recipe.ingredients.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#868E96] uppercase tracking-wider">已添加食材</h3>
          {recipe.ingredients.map((ing, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border border-[#E9ECEF] rounded-lg group hover:border-[#4CAF50] transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-medium text-[#212529]">{ing.name}</span>
                <span className="text-[#868E96]">{ing.amount}{ing.unit}</span>
              </div>
              <button
                onClick={() => removeIngredient(index)}
                className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-[#868E96] hover:text-[#F44336]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Step 3: Steps
function Step3Steps({ 
  recipe, 
  updateRecipe 
}: { 
  recipe: RecipeCreate
  updateRecipe: (u: Partial<RecipeCreate>) => void
}) {
  const [newStep, setNewStep] = useState('')

  const handleAdd = () => {
    if (newStep.trim()) {
      updateRecipe({
        steps: [...recipe.steps, {
          order: recipe.steps.length + 1,
          description: newStep,
        }]
      })
      setNewStep('')
    }
  }

  const removeStep = (index: number) => {
    const filtered = recipe.steps.filter((_, i) => i !== index)
    updateRecipe({ 
      steps: filtered.map((s, i) => ({ ...s, order: i + 1 })) 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-[#212529] mb-6">烹饪步骤</h2>

      {/* Add Step */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#212529] mb-2">
            步骤 {recipe.steps.length + 1}
          </label>
          <textarea
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="描述这一步的操作..."
            rows={3}
            className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#4CAF50] outline-none resize-none"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newStep.trim()}
          className="w-full py-3 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加步骤
        </button>
      </div>

      {/* Steps List */}
      {recipe.steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#868E96] uppercase tracking-wider">已添加步骤</h3>
          {recipe.steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-white border border-[#E9ECEF] rounded-lg group hover:border-[#4CAF50] transition-colors"
            >
              <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {step.order}
              </div>
              <p className="flex-1 text-[#212529] leading-relaxed pt-1">{step.description}</p>
              <button
                onClick={() => removeStep(index)}
                className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-[#868E96] hover:text-[#F44336]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
