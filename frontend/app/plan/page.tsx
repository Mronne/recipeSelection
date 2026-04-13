'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Calendar, ShoppingCart, Trash2, ChefHat, 
  Sun, Moon, Sunrise, Check, X, ShieldAlert 
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useRecipes } from '@/hooks/useRecipes'
import { 
  getMealPlans, saveMealPlan, deleteMealPlan, 
  generateShoppingList, saveShoppingList,
  MealPlan 
} from '@/lib/meal-plan'
import { isAdmin, getCurrentUser, canGenerateShoppingList } from '@/lib/auth'
import { useAuthGuard } from '@/hooks/useAuthGuard'

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function PlanPage() {
  useAuthGuard('logged-in')
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState<'daily' | 'weekly'>('daily')
  const [userRole, setUserRole] = useState<string>('guest')
  const [canShop, setCanShop] = useState(false)
  
  useEffect(() => {
    const user = getCurrentUser()
    setUserRole(user?.role || 'guest')
    setCanShop(canGenerateShoppingList())
    setPlans(getMealPlans())
  }, [])

  const handleDelete = (planId: string) => {
    if (confirm('确定要删除这个菜单计划吗？')) {
      deleteMealPlan(planId)
      setPlans(getMealPlans())
    }
  }

  const handleCreatePlan = (plan: MealPlan) => {
    saveMealPlan(plan)
    setPlans(getMealPlans())
    setShowCreateModal(false)
    
    if (canGenerateShoppingList()) {
      const shoppingList = generateShoppingList(plan.id)
      saveShoppingList(plan.id, shoppingList)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="bg-white border-b border-[#E9ECEF] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">点菜计划</h1>
              <p className="text-sm text-[#868E96]">
                当前身份: <span className="font-medium text-[#4CAF50]">
                  {userRole === 'admin' ? '管理员' : userRole === 'user' ? '普通用户' : '游客'}
                </span>
                {!canShop && '（不能生成购物清单）'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setCreateType('daily'); setShowCreateModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold hover:bg-[#43A047]"
              >
                <Plus className="w-5 h-5" />
                今日菜单
              </button>
              <button
                onClick={() => { setCreateType('weekly'); setShowCreateModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#E8F5E9] text-[#4CAF50] rounded-lg font-semibold hover:bg-[#C8E6C9]"
              >
                <Calendar className="w-5 h-5" />
                一周菜单
              </button>
            </div>
          </div>
        </header>

        {!canShop && (
          <div className="mx-4 mt-4 p-4 bg-[#FFF3E0] border border-[#FFCC80] rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#E65100] font-medium">权限提示</p>
              <p className="text-xs text-[#F57C00]">
                {userRole === 'guest' 
                  ? '游客可以点菜，但不能生成购物清单。请登录普通用户或管理员账号使用完整功能。'
                  : '普通用户可以点菜，但只有管理员可以生成购物清单。'}
              </p>
            </div>
          </div>
        )}

        <div className="p-4">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-[#ADB5BD] mx-auto mb-4" />
              <p className="text-[#495057] text-lg font-medium mb-2">还没有菜单计划</p>
              <p className="text-[#868E96] mb-6">
                创建今日菜单或一周菜单
                {canShop && '，自动生成购物清单'}
              </p>
              <button
                onClick={() => { setCreateType('daily'); setShowCreateModal(true) }}
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-semibold"
              >
                创建今日菜单
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  canShop={canShop}
                  onDelete={() => handleDelete(plan.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreatePlanModal
          type={createType}
          canShop={canShop}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlan}
        />
      )}
    </div>
  )
}

function PlanCard({ plan, canShop, onDelete }: { plan: MealPlan; canShop: boolean; onDelete: () => void }) {
  // 按餐类分组
  const breakfast = plan.recipes.filter(r => r.mealType === 'breakfast')
  const lunch = plan.recipes.filter(r => r.mealType === 'lunch')
  const dinner = plan.recipes.filter(r => r.mealType === 'dinner')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#E9ECEF] p-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{plan.name}</h3>
          <p className="text-sm text-[#868E96]">
            {plan.recipes.length} 道菜 · {new Date(plan.date).toLocaleDateString('zh-CN')}
          </p>
        </div>
        <div className="flex gap-2">
          {canShop ? (
            <Link
              href={`/shopping?planId=${plan.id}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#E8F5E9] text-[#4CAF50] rounded-lg text-sm font-medium hover:bg-[#C8E6C9]"
            >
              <ShoppingCart className="w-4 h-4" />
              购物清单
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 px-3 py-1.5 bg-[#F1F3F5] text-[#ADB5BD] rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              购物清单
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-[#868E96] hover:text-[#F44336] hover:bg-[#FFEBEE] rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 三餐分组显示 */}
      <div className="space-y-3">
        {breakfast.length > 0 && (
          <MealGroup icon={Sunrise} label="早餐" recipes={breakfast} color="text-orange-500" bgColor="bg-orange-50" />
        )}
        {lunch.length > 0 && (
          <MealGroup icon={Sun} label="午餐" recipes={lunch} color="text-yellow-500" bgColor="bg-yellow-50" />
        )}
        {dinner.length > 0 && (
          <MealGroup icon={Moon} label="晚餐" recipes={dinner} color="text-indigo-500" bgColor="bg-indigo-50" />
        )}
      </div>
    </motion.div>
  )
}

function MealGroup({ icon: Icon, label, recipes, color, bgColor }: any) {
  return (
    <div className={`p-3 ${bgColor} rounded-lg`}>
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs opacity-70">({recipes.length}道)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {recipes.map((recipe: any, idx: number) => (
          <span key={idx} className="px-2 py-1 bg-white rounded text-sm text-[#495057]">
            {recipe.recipeName} · {recipe.servings}人份
          </span>
        ))}
      </div>
    </div>
  )
}

function CreatePlanModal({ 
  type, 
  canShop,
  onClose, 
  onCreate 
}: { 
  type: 'daily' | 'weekly'
  canShop: boolean
  onClose: () => void
  onCreate: (plan: any) => void 
}) {
  const { recipes } = useRecipes()
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, any[]>>({})
  const [currentDay, setCurrentDay] = useState(0)
  const [currentMeal, setCurrentMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast')

  const MEAL_OPTIONS = [
    { key: 'breakfast', label: '早餐', icon: Sunrise, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { key: 'lunch', label: '午餐', icon: Sun, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { key: 'dinner', label: '晚餐', icon: Moon, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  ]

  const toggleRecipe = (recipe: any) => {
    const dayKey = type === 'daily' ? 'today' : `day_${currentDay}`
    const mealKey = `${dayKey}_${currentMeal}`
    const current = selectedRecipes[mealKey] || []
    const exists = current.find((r: any) => r.recipeId === recipe.id)
    
    if (exists) {
      setSelectedRecipes({
        ...selectedRecipes,
        [mealKey]: current.filter((r: any) => r.recipeId !== recipe.id)
      })
    } else {
      setSelectedRecipes({
        ...selectedRecipes,
        [mealKey]: [...current, { 
          recipeId: recipe.id, 
          recipeName: recipe.name, 
          servings: recipe.servings,
          mealType: currentMeal 
        }]
      })
    }
  }

  const isSelected = (recipeId: string) => {
    const dayKey = type === 'daily' ? 'today' : `day_${currentDay}`
    const mealKey = `${dayKey}_${currentMeal}`
    return (selectedRecipes[mealKey] || []).some((r: any) => r.recipeId === recipeId)
  }

  const getTotalCount = () => {
    return Object.values(selectedRecipes).flat().length
  }

  const handleCreate = () => {
    const allRecipes = Object.values(selectedRecipes).flat()
    if (allRecipes.length === 0) {
      alert('请至少选择一道菜')
      return
    }
    
    const plan: MealPlan = {
      id: `${type}_${Date.now()}`,
      name: type === 'daily' 
        ? `${new Date().toLocaleDateString('zh-CN')} 今日菜单`
        : `${WEEK_DAYS[currentDay]}菜单`,
      date: new Date().toISOString().split('T')[0],
      recipes: allRecipes as any,
    }
    
    onCreate(plan)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {type === 'daily' ? '创建今日菜单' : '创建一周菜单'}
            </h2>
            {!canShop && (
              <p className="text-xs text-[#FF9800]">注意：您点菜后不能生成购物清单</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Week Day Selector */}
        {type === 'weekly' && (
          <div className="flex gap-2 p-4 overflow-x-auto border-b border-[#E9ECEF]">
            {WEEK_DAYS.map((day, idx) => {
              const dayCount = Object.entries(selectedRecipes)
                .filter(([key]) => key.startsWith(`day_${idx}_`))
                .reduce((sum, [, recipes]) => sum + recipes.length, 0)
              return (
                <button
                  key={day}
                  onClick={() => setCurrentDay(idx)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    currentDay === idx
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#F1F3F5] text-[#495057]'
                  }`}
                >
                  {day}
                  {dayCount > 0 && <span className="ml-1 text-xs">({dayCount})</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Meal Type Selector */}
        <div className="flex gap-2 p-4 border-b border-[#E9ECEF]">
          {MEAL_OPTIONS.map((meal) => {
            const Icon = meal.icon
            const dayKey = type === 'daily' ? 'today' : `day_${currentDay}`
            const mealKey = `${dayKey}_${meal.key}`
            const count = (selectedRecipes[mealKey] || []).length
            return (
              <button
                key={meal.key}
                onClick={() => setCurrentMeal(meal.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                  currentMeal === meal.key
                    ? meal.color
                    : 'bg-white border-[#E9ECEF] text-[#495057] hover:border-[#DEE2E6]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{meal.label}</span>
                {count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${currentMeal === meal.key ? 'bg-white/50' : 'bg-[#E9ECEF]'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Recipe Selection */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold mb-3">
            选择{MEAL_OPTIONS.find(m => m.key === currentMeal)?.label}菜谱
          </h3>
          <div className="space-y-2">
            {recipes.map((recipe) => {
              const selected = isSelected(recipe.id)
              return (
                <div
                  key={recipe.id}
                  onClick={() => toggleRecipe(recipe)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selected
                      ? 'bg-[#E8F5E9] border-2 border-[#4CAF50]'
                      : 'bg-[#F8F9FA] border-2 border-transparent hover:border-[#E9ECEF]'
                  }`}
                >
                  {selected && <Check className="w-5 h-5 text-[#4CAF50]" />}
                  <div className="flex-1">
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-[#868E96]">{recipe.servings}人份 · {recipe.cookTime}分钟</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E9ECEF] flex justify-between items-center">
          <span className="text-[#868E96]">
            已选 <span className="font-bold text-[#212529]">{getTotalCount()}</span> 道菜
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-[#E9ECEF] rounded-lg">
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={getTotalCount() === 0}
              className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg font-semibold disabled:opacity-50"
            >
              创建菜单
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
