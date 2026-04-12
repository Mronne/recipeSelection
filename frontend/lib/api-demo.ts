// 演示模式数据 - 无需后端
import { Recipe, RecipeCreate, User } from '@/types'

const DEMO_RECIPES: Recipe[] = [
  {
    id: '1',
    name: '红烧肉',
    description: '肥而不腻，入口即化的经典家常菜',
    coverImage: '',
    prepTime: 20,
    cookTime: 60,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      { id: '1', name: '五花肉', amount: 500, unit: '克', category: 'meat' },
      { id: '2', name: '葱', amount: 2, unit: '根', category: 'vegetables' },
      { id: '3', name: '生姜', amount: 3, unit: '片', category: 'vegetables' },
      { id: '4', name: '冰糖', amount: 30, unit: '克', category: 'seasonings' },
      { id: '5', name: '生抽', amount: 2, unit: '汤匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '五花肉洗净切成3厘米见方的块' },
      { id: '2', order: 2, description: '冷水下锅焯水，撇去浮沫后捞出沥干' },
      { id: '3', order: 3, description: '锅中放少许油，下入冰糖小火炒至焦糖色' },
      { id: '4', order: 4, description: '放入肉块翻炒上色' },
      { id: '5', order: 5, description: '加入葱姜、料酒、生抽、老抽翻炒均匀' },
      { id: '6', order: 6, description: '加入开水没过肉块，大火烧开后转小火炖煮1小时' },
      { id: '7', order: 7, description: '大火收汁，出锅前撒上葱花即可' },
    ],
    tags: ['中餐', '家常菜', '下饭菜'],
    category: '中餐',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: '番茄炒蛋',
    description: '酸甜可口，老少皆宜的经典快手菜',
    coverImage: '',
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { id: '1', name: '鸡蛋', amount: 3, unit: '个', category: 'eggs_dairy' },
      { id: '2', name: '西红柿', amount: 2, unit: '个', category: 'vegetables' },
      { id: '3', name: '葱', amount: 1, unit: '根', category: 'vegetables' },
      { id: '4', name: '盐', amount: 1, unit: '茶匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '鸡蛋打散，加入少许盐搅匀' },
      { id: '2', order: 2, description: '西红柿切块，葱切葱花' },
      { id: '3', order: 3, description: '热锅凉油，倒入蛋液炒熟盛出' },
      { id: '4', order: 4, description: '锅中留底油，放入西红柿翻炒出汁' },
      { id: '5', order: 5, description: '加入炒好的鸡蛋，调入盐、糖、生抽' },
      { id: '6', order: 6, description: '翻炒均匀，撒上葱花出锅' },
    ],
    tags: ['中餐', '快手菜', '家常菜'],
    category: '中餐',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
  {
    id: '3',
    name: '蒜蓉西兰花',
    description: '清爽健康的快手素菜',
    coverImage: '',
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { id: '1', name: '西兰花', amount: 300, unit: '克', category: 'vegetables' },
      { id: '2', name: '大蒜', amount: 4, unit: '瓣', category: 'vegetables' },
      { id: '3', name: '盐', amount: 1, unit: '茶匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '西兰花掰成小朵，洗净' },
      { id: '2', order: 2, description: '烧一锅水，加少许盐和油，焯烫西兰花1分钟' },
      { id: '3', order: 3, description: '捞出过凉水，沥干水分' },
      { id: '4', order: 4, description: '大蒜剁成蒜蓉' },
      { id: '5', order: 5, description: '热锅凉油，爆香蒜蓉' },
      { id: '6', order: 6, description: '放入西兰花快速翻炒' },
      { id: '7', order: 7, description: '调入盐、生抽、香油，炒匀出锅' },
    ],
    tags: ['中餐', '快手菜', '素食'],
    category: '中餐',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
]

let recipes = [...DEMO_RECIPES]

export const isDemoMode = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('demo_mode') === 'true'
}

// Demo API
export const demoApi = {
  async getRecipes(params?: { search?: string; categories?: string[] }): Promise<{ recipes: Recipe[]; total: number; page: number }> {
    await delay(500) // 模拟网络延迟
    let result = [...recipes]
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      result = result.filter(r => 
        r.name.toLowerCase().includes(search) || 
        r.description.toLowerCase().includes(search)
      )
    }
    
    if (params?.categories?.length) {
      result = result.filter(r => params.categories?.includes(r.category))
    }
    
    return { recipes: result, total: result.length, page: 1 }
  },

  async getRecipe(id: string): Promise<Recipe | null> {
    await delay(300)
    return recipes.find(r => r.id === id) || null
  },

  async createRecipe(data: RecipeCreate): Promise<Recipe> {
    await delay(800)
    const newRecipe: Recipe = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ingredients: data.ingredients.map((ing, i) => ({ ...ing, id: `ing-${i}` })),
      steps: data.steps.map((step, i) => ({ ...step, id: `step-${i}` })),
    }
    recipes.unshift(newRecipe)
    return newRecipe
  },

  async deleteRecipe(id: string): Promise<void> {
    await delay(300)
    recipes = recipes.filter(r => r.id !== id)
  },

  async getCurrentUser(): Promise<User> {
    await delay(200)
    return {
      id: 'demo-user',
      username: 'demo',
      email: 'demo@example.com',
      fullName: '演示用户',
      admin: false,
    }
  },
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
