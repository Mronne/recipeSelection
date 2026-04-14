// ==================== 基础类型 ====================

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  category: string
  checked?: boolean
}

export interface Step {
  id: string
  order: number
  description: string
  image?: string
}

export interface Recipe {
  id: string
  slug: string
  name: string
  description: string
  coverImage: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: Ingredient[]
  steps: Step[]
  tags: string[]
  category: string
  createdAt: string
  updatedAt: string
}

export interface RecipeCreate {
  name: string
  description: string
  coverImage: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: Omit<Ingredient, 'id'>[]
  steps: Omit<Step, 'id'>[]
  tags: string[]
  category: string
}

// ==================== Mealie API 类型 ====================

export interface MealieRecipe {
  id: string
  slug: string
  name: string
  description: string
  image: string | null
  recipeYield: string
  recipeIngredient: MealieIngredient[]
  recipeInstructions: MealieInstruction[]
  tags: MealieTag[] | string[]
  recipeCategory: MealieCategory[] | string[]
  totalTime: string | null
  prepTime: string | null
  performTime: string | null
  rating: number | null
  orgURL: string | null
  dateAdded: string
  dateUpdated: string
}

export interface MealieIngredient {
  id?: string
  referenceId?: string
  quantity: number
  unit: MealieUnit | null
  food: MealieFood | null
  note: string
  display: string
  title: string | null
  original_text: string
  reference_id?: string
}

export interface MealieInstruction {
  id?: string
  text: string
  ingredient_references: any[]
  title: string | null
}

export interface MealieFood {
  id?: string
  name: string
  description: string
}

export interface MealieUnit {
  id?: string
  name: string
  description: string
}

export interface MealieTag {
  id?: string
  name: string
  slug: string
}

export interface MealieCategory {
  id?: string
  name: string
  slug: string
}

export interface PaginationResponse<T> {
  items: T[]
  page: number
  per_page: number
  total: number
}

// ==================== 用户认证类型 ====================

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  admin: boolean
  cacheKey?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// ==================== 食材/单位类型 ====================

export interface FoodItem {
  id: string
  name: string
  description?: string
}

export interface UnitItem {
  id: string
  name: string
  description?: string
}
