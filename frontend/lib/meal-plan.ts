// 点菜和购物清单管理

const MEAL_PLAN_KEY = 'meal_plan'
const SHOPPING_LIST_KEY = 'shopping_list'

export interface MealPlan {
  id: string
  name: string
  date: string
  recipes: {
    recipeId: string
    recipeName: string
    servings: number
    mealType: 'breakfast' | 'lunch' | 'dinner'
  }[]
}

export interface ShoppingItem {
  id: string
  name: string
  amount: number
  unit: string
  checked: boolean
  category: string
  sourceRecipes: string[]
}

// 获取所有点菜计划
export function getMealPlans(): MealPlan[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(MEAL_PLAN_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 保存点菜计划
export function saveMealPlan(plan: MealPlan): void {
  if (typeof window === 'undefined') return
  const plans = getMealPlans()
  const existingIndex = plans.findIndex(p => p.id === plan.id)
  if (existingIndex >= 0) {
    plans[existingIndex] = plan
  } else {
    plans.push(plan)
  }
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plans))
}

// 删除点菜计划
export function deleteMealPlan(planId: string): void {
  if (typeof window === 'undefined') return
  const plans = getMealPlans().filter(p => p.id !== planId)
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plans))
}

// 生成购物清单
export function generateShoppingList(planId: string): ShoppingItem[] {
  const plan = getMealPlans().find(p => p.id === planId)
  if (!plan) return []
  
  // 这里简化处理，实际应该从菜谱详情中获取食材
  // 现在使用模拟数据
  const items: ShoppingItem[] = []
  const itemMap = new Map<string, ShoppingItem>()
  
  // 模拟根据菜谱生成购物清单
  plan.recipes.forEach(recipe => {
    // 模拟食材（实际应该从菜谱API获取）
    const mockIngredients = [
      { name: '猪肉', amount: 200, unit: '克', category: '肉类' },
      { name: '青菜', amount: 300, unit: '克', category: '蔬菜' },
      { name: '大米', amount: 100, unit: '克', category: '主食' },
    ]
    
    mockIngredients.forEach(ing => {
      const key = `${ing.name}_${ing.unit}`
      const existing = itemMap.get(key)
      if (existing) {
        existing.amount += ing.amount * (recipe.servings / 2)
        existing.sourceRecipes.push(recipe.recipeName)
      } else {
        itemMap.set(key, {
          id: Date.now().toString() + Math.random().toString(36),
          name: ing.name,
          amount: ing.amount * (recipe.servings / 2),
          unit: ing.unit,
          checked: false,
          category: ing.category,
          sourceRecipes: [recipe.recipeName],
        })
      }
    })
  })
  
  return Array.from(itemMap.values())
}

// 获取购物清单
export function getShoppingList(planId: string): ShoppingItem[] {
  if (typeof window === 'undefined') return []
  try {
    const key = `${SHOPPING_LIST_KEY}_${planId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : generateShoppingList(planId)
  } catch {
    return []
  }
}

// 保存购物清单
export function saveShoppingList(planId: string, items: ShoppingItem[]): void {
  if (typeof window === 'undefined') return
  const key = `${SHOPPING_LIST_KEY}_${planId}`
  localStorage.setItem(key, JSON.stringify(items))
}

// 更新购物项状态
export function toggleShoppingItem(planId: string, itemId: string): void {
  const items = getShoppingList(planId)
  const updated = items.map(item =>
    item.id === itemId ? { ...item, checked: !item.checked } : item
  )
  saveShoppingList(planId, updated)
}

// 创建今日菜单
export function createDailyPlan(recipes: { recipeId: string; recipeName: string; servings: number; mealType: string }[]): MealPlan {
  const today = new Date().toISOString().split('T')[0]
  return {
    id: `daily_${today}_${Date.now()}`,
    name: `${today} 今日菜单`,
    date: today,
    recipes: recipes.map(r => ({
      ...r,
      mealType: r.mealType as any,
    })),
  }
}

// 创建一周菜单
export function createWeeklyPlan(weekRecipes: Record<string, { recipeId: string; recipeName: string; servings: number }[]>): MealPlan {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  
  const allRecipes: MealPlan['recipes'] = []
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  Object.entries(weekRecipes).forEach(([dayIndex, recipes]) => {
    (recipes as any[]).forEach(recipe => {
      allRecipes.push({
        ...recipe,
        mealType: 'dinner',
      })
    })
  })
  
  return {
    id: `weekly_${weekStartStr}_${Date.now()}`,
    name: `${weekStartStr} 开始的一周菜单`,
    date: weekStartStr,
    recipes: allRecipes,
  }
}
