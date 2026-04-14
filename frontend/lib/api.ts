import axios, { AxiosInstance, AxiosError } from 'axios'
import type { 
  Recipe, RecipeCreate, MealieRecipe, PaginationResponse,
  LoginCredentials, AuthResponse, User, FoodItem, UnitItem 
} from '@/types'
import { 
  fromBackendRecipe, toBackendRecipe, 
  fromBackendIngredient, toBackendIngredient 
} from './adapters'

// ==================== API 客户端配置 ====================

// 使用相对路径，让Next.js rewrite代理到后端
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// 开发环境下后端地址
const BACKEND_URL = 'http://localhost:9000'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器 - 添加认证头
    this.client.interceptors.request.use(
      (config) => {
        // 每次请求都从 localStorage 读取最新 token
        const token = typeof window !== 'undefined' ? localStorage.getItem('mealie_token') : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器 - 错误处理
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ detail?: any; message?: string }>) => {
        if (error.response?.data) {
          const data = error.response.data
          let detailText = ''
          if (Array.isArray(data.detail)) {
            detailText = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
          } else if (typeof data.detail === 'string') {
            detailText = data.detail
          } else if (data.message) {
            detailText = data.message
          } else {
            detailText = JSON.stringify(data)
          }
          ;(error as any).displayMessage = `${error.message}: ${detailText}`
        }
        return Promise.reject(error)
      }
    )
  }

  // ==================== 认证管理 ====================

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('mealie_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mealie_token')
      // 同时清除 cookie
      document.cookie = 'mealie_token=; path=/; max-age=0'
    }
  }

  loadToken(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mealie_token')
      if (token) {
        this.token = token
        return true
      }
    }
    return false
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // ==================== 认证 API ====================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mealie 使用 form-data 格式登录
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await this.client.post<AuthResponse>('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    this.setToken(response.data.access_token)
    return response.data
  }

  async logout(): Promise<void> {
    this.clearToken()
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/self')
    return response.data
  }

  // ==================== 食谱 API ====================

  async getRecipes(params?: {
    page?: number
    perPage?: number
    search?: string
    categories?: string[]
    tags?: string[]
  }): Promise<{ recipes: Recipe[]; total: number; page: number }> {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.perPage) queryParams.append('perPage', String(params.perPage))
    if (params?.search) queryParams.append('search', params.search)
    if (params?.categories?.length) {
      params.categories.forEach(c => queryParams.append('categories', c))
    }
    if (params?.tags?.length) {
      params.tags.forEach(t => queryParams.append('tags', t))
    }

    const response = await this.client.get<PaginationResponse<MealieRecipe>>(
      `/recipes?${queryParams.toString()}`
    )

    return {
      recipes: response.data.items.map(fromBackendRecipe),
      total: response.data.total,
      page: response.data.page,
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.client.get<MealieRecipe>(`/recipes/${id}`)
    return fromBackendRecipe(response.data)
  }

  async createRecipe(data: RecipeCreate): Promise<Recipe> {
    const backendData = toBackendRecipe(data)
    const response = await this.client.post<MealieRecipe>('/recipes', backendData)
    return fromBackendRecipe(response.data)
  }

  async updateRecipe(id: string, data: Partial<RecipeCreate>): Promise<Recipe> {
    const backendData = toBackendRecipe(data as RecipeCreate)
    const response = await this.client.put<MealieRecipe>(`/recipes/${id}`, backendData)
    return fromBackendRecipe(response.data)
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.client.delete(`/recipes/${id}`)
  }

  async scrapeRecipe(url: string): Promise<Recipe> {
    const response = await this.client.post<MealieRecipe>('/recipes/create-url', {
      url,
      include_tags: true,
    })
    return fromBackendRecipe(response.data)
  }

  // ==================== 图片上传 API ====================

  async uploadRecipeImage(recipeSlug: string, file: File): Promise<string> {
    // 使用 FormData 上传，符合后端要求
    const formData = new FormData()
    formData.append('image', file)
    formData.append('extension', file.name.split('.').pop() || 'jpg')
    
    const response = await this.client.put<{ image: string }>(
      `/recipes/${recipeSlug}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.image
  }

  // ==================== 收藏 API ====================

  async addToFavorites(recipeId: string): Promise<void> {
    await this.client.post(`/users/self/favorites/${recipeId}`)
  }

  async removeFromFavorites(recipeId: string): Promise<void> {
    await this.client.delete(`/users/self/favorites/${recipeId}`)
  }

  async getFavorites(): Promise<Recipe[]> {
    const response = await this.client.get<PaginationResponse<MealieRecipe>>('/users/self/favorites')
    return response.data.items.map(fromBackendRecipe)
  }

  // ==================== 食材 API ====================

  async getFoods(search?: string): Promise<FoodItem[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    const response = await this.client.get<PaginationResponse<{ id: string; name: string }>>(
      `/foods${params}`
    )
    return response.data.items.map(item => ({
      id: item.id,
      name: fromBackendIngredient(item.name),
    }))
  }

  async createFood(name: string): Promise<FoodItem> {
    const response = await this.client.post<{ id: string; name: string }>('/foods', {
      name: toBackendIngredient(name),
    })
    return {
      id: response.data.id,
      name: fromBackendIngredient(response.data.name),
    }
  }

  // ==================== 单位 API ====================

  async getUnits(): Promise<UnitItem[]> {
    const response = await this.client.get<PaginationResponse<{ id: string; name: string }>>('/units')
    return response.data.items
  }

  // ==================== 标签 API ====================

  async getTags(): Promise<{ id: string; name: string; slug: string }[]> {
    const response = await this.client.get<PaginationResponse<{ id: string; name: string; slug: string }>>('/tags')
    return response.data.items
  }

  // ==================== 分类 API ====================

  async getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
    const response = await this.client.get<PaginationResponse<{ id: string; name: string; slug: string }>>('/categories')
    return response.data.items
  }

  // ==================== 用户注册 API ====================

  async register(data: {
    username: string
    password: string
    email?: string
    fullName?: string
  }): Promise<User> {
    const response = await this.client.post<User>('/users/register', {
      username: data.username,
      password: data.password,
      email: data.email,
      fullName: data.fullName,
    })
    return response.data
  }

  // ==================== 头像上传 API ====================

  async uploadUserAvatar(userId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('profile', file)
    
    await this.client.post(`/users/${userId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  getUserAvatarUrl(userId: string, cacheKey?: string): string {
    const cacheParam = cacheKey ? `?cache_key=${cacheKey}` : ''
    return `${API_BASE_URL}/api/users/${userId}/image.webp${cacheParam}`
  }

  // 获取食谱图片完整 URL（用于直接显示）
  getRecipeImageUrl(recipeId: string, cacheKey?: string): string {
    // 单镜像部署下使用相对路径
    const url = `/api/media/recipes/${recipeId}/images/original.webp`
    return cacheKey ? `${url}?c=${cacheKey}` : url
  }
}

// 导出单例实例
export const api = new ApiClient()

// 导出便捷函数
export const login = (credentials: LoginCredentials) => api.login(credentials)
export const logout = () => api.logout()
export const getCurrentUser = () => api.getCurrentUser()
export const getRecipes = (params?: Parameters<typeof api.getRecipes>[0]) => api.getRecipes(params)
export const getRecipe = (id: string) => api.getRecipe(id)
export const createRecipe = (data: RecipeCreate) => api.createRecipe(data)
export const updateRecipe = (id: string, data: Partial<RecipeCreate>) => api.updateRecipe(id, data)
export const deleteRecipe = (id: string) => api.deleteRecipe(id)
export const uploadRecipeImage = (recipeId: string, file: File) => api.uploadRecipeImage(recipeId, file)
export const getFoods = (search?: string) => api.getFoods(search)
export const createFood = (name: string) => api.createFood(name)
export const getUnits = () => api.getUnits()
export const getTags = () => api.getTags()
export const getCategories = () => api.getCategories()
