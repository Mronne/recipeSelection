'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Plus, X, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { api } from '@/lib/api'
import { Recipe, RecipeCreate } from '@/types'
import ImageUploader from '@/components/ImageUploader'

const DIFFICULTIES = [
  { value: 'easy', label: '简单', color: '#4CAF50' },
  { value: 'medium', label: '中等', color: '#FF9800' },
  { value: 'hard', label: '困难', color: '#F44336' },
]

export default function EditRecipeClient({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [recipe, setRecipe] = useState<Partial<RecipeCreate>>({
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

  useEffect(() => {
    loadRecipe()
  }, [recipeId])

  const loadRecipe = async () => {
    try {
      const data = await api.getRecipe(recipeId)
      setRecipe({
        name: data.name,
        description: data.description,
        coverImage: data.coverImage,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        ingredients: data.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit, category: i.category })),
        steps: data.steps.map(s => ({ order: s.order, description: s.description })),
        tags: data.tags,
        category: data.category,
      })
    } catch (err) {
      alert('加载菜谱失败')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!recipe.name) {
      alert('请输入菜谱名称')
      return
    }

    setIsSaving(true)
    try {
      await api.updateRecipe(recipeId, recipe as RecipeCreate)

      // 如果有新图片，上传图片
      if (imageFile) {
        try {
          await api.uploadRecipeImage(recipeId, imageFile)
        } catch (err: any) {
          console.error('图片上传失败', err)
          alert(`菜谱已保存，但图片上传失败：${err?.displayMessage || err?.message || '未知错误'}`)
          setIsSaving(false)
          return
        }
      }

      alert('保存成功！')
      router.push(`/recipe/detail?id=${recipeId}`)
    } catch (err) {
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const updateRecipe = (updates: Partial<RecipeCreate>) => {
    setRecipe(prev => ({ ...prev, ...updates }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />
        <main className="lg:ml-60 min-h-screen flex items-center justify-center">
          <div className="text-[#868E96]">加载中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="sticky top-16 lg:top-0 z-40 bg-white border-b border-[#E9ECEF] px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/recipe/detail?id=${recipeId}`} className="p-2 hover:bg-[#F8F9FA] rounded-lg">
                <ArrowLeft className="w-6 h-6 text-[#495057]" />
              </Link>
              <h1 className="text-xl font-bold text-[#212529]">编辑菜谱</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047] disabled:opacity-50"
            >
              {isSaving ? '保存中...' : <><Check className="w-5 h-5" /> 保存</>}
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
          {/* Image */}
          <div className="max-w-xs mx-auto">
            <ImageUploader
              value={recipe.coverImage || ''}
              onChange={(url, file) => {
                updateRecipe({ coverImage: url })
                setImageFile(file || null)
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#212529] mb-2">菜谱名称 *</label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => updateRecipe({ name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#212529] mb-2">描述</label>
            <textarea
              value={recipe.description}
              onChange={(e) => updateRecipe({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none resize-none"
            />
          </div>

          {/* Time & Servings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">准备时间(分)</label>
              <input
                type="number"
                value={recipe.prepTime}
                onChange={(e) => updateRecipe({ prepTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">烹饪时间(分)</label>
              <input
                type="number"
                value={recipe.cookTime}
                onChange={(e) => updateRecipe({ cookTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-2">份量(人)</label>
              <input
                type="number"
                value={recipe.servings}
                onChange={(e) => updateRecipe({ servings: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
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
                      : 'bg-[#F1F3F5] text-[#495057]'
                  }`}
                  style={{ backgroundColor: recipe.difficulty === diff.value ? diff.color : undefined }}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-4">
            <h3 className="font-semibold mb-4">食材清单</h3>
            <IngredientEditor 
              ingredients={recipe.ingredients || []}
              onChange={(ings) => updateRecipe({ ingredients: ings })}
            />
          </div>

          {/* Steps */}
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-4">
            <h3 className="font-semibold mb-4">烹饪步骤</h3>
            <StepEditor 
              steps={recipe.steps || []}
              onChange={(steps) => updateRecipe({ steps })}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// Ingredient Editor
function IngredientEditor({ ingredients, onChange }: { ingredients: any[], onChange: (ings: any[]) => void }) {
  const [newIng, setNewIng] = useState({ name: '', amount: '', unit: '克' })

  const addIngredient = () => {
    if (!newIng.name || !newIng.amount) return
    onChange([...ingredients, { name: newIng.name, amount: parseFloat(newIng.amount), unit: newIng.unit, category: 'other' }])
    setNewIng({ name: '', amount: '', unit: '克' })
  }

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ing, index) => (
        <div key={index} className="flex items-center gap-2 p-3 bg-[#F8F9FA] rounded-lg">
          <GripVertical className="w-4 h-4 text-[#ADB5BD]" />
          <span className="flex-1">{ing.name}</span>
          <span className="text-[#868E96]">{ing.amount}{ing.unit}</span>
          <button onClick={() => removeIngredient(index)} className="p-1 hover:bg-[#FFEBEE] rounded">
            <X className="w-4 h-4 text-[#F44336]" />
          </button>
        </div>
      ))}
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="食材名称"
          value={newIng.name}
          onChange={(e) => setNewIng({ ...newIng, name: e.target.value })}
          className="flex-1 px-3 py-2 border border-[#E9ECEF] rounded-lg"
        />
        <input
          type="number"
          placeholder="数量"
          value={newIng.amount}
          onChange={(e) => setNewIng({ ...newIng, amount: e.target.value })}
          className="w-20 px-3 py-2 border border-[#E9ECEF] rounded-lg"
        />
        <select
          value={newIng.unit}
          onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
          className="w-20 px-3 py-2 border border-[#E9ECEF] rounded-lg"
        >
          <option>克</option>
          <option>个</option>
          <option>勺</option>
          <option>毫升</option>
        </select>
        <button onClick={addIngredient} className="p-2 bg-[#4CAF50] text-white rounded-lg">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Step Editor
function StepEditor({ steps, onChange }: { steps: any[], onChange: (steps: any[]) => void }) {
  const [newStep, setNewStep] = useState('')

  const addStep = () => {
    if (!newStep.trim()) return
    onChange([...steps, { order: steps.length + 1, description: newStep }])
    setNewStep('')
  }

  const removeStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index)
    onChange(filtered.map((s, i) => ({ ...s, order: i + 1 })))
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-3 p-3 bg-[#F8F9FA] rounded-lg">
          <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {step.order}
          </div>
          <p className="flex-1">{step.description}</p>
          <button onClick={() => removeStep(index)} className="p-1 hover:bg-[#FFEBEE] rounded">
            <X className="w-4 h-4 text-[#F44336]" />
          </button>
        </div>
      ))}
      
      <div className="flex gap-2">
        <textarea
          placeholder={`步骤 ${steps.length + 1}`}
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          rows={2}
          className="flex-1 px-3 py-2 border border-[#E9ECEF] rounded-lg resize-none"
        />
        <button onClick={addStep} className="p-2 bg-[#4CAF50] text-white rounded-lg">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
