'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { demoApi, isDemoMode } from '@/lib/api-demo'
import type { Recipe, RecipeCreate } from '@/types'

interface UseRecipesOptions {
  page?: number
  perPage?: number
  search?: string
  categories?: string[]
}

export function useRecipes(options: UseRecipesOptions = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let result
      if (isDemoMode()) {
        result = await demoApi.getRecipes(options)
      } else {
        result = await api.getRecipes(options)
      }
      setRecipes(result.recipes)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [options.search, options.categories?.join(',')])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  return {
    recipes,
    isLoading,
    error,
    total,
    refetch: fetchRecipes,
  }
}

export function useRecipe(id: string | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipe = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      let result
      if (isDemoMode()) {
        result = await demoApi.getRecipe(id)
      } else {
        result = await api.getRecipe(id)
      }
      setRecipe(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  const remove = useCallback(async () => {
    if (!id) return { success: false, error: '无效ID' }
    setIsLoading(true)
    try {
      if (isDemoMode()) {
        await demoApi.deleteRecipe(id)
      } else {
        await api.deleteRecipe(id)
      }
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '删除失败' 
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  return {
    recipe,
    isLoading,
    error,
    refetch: fetchRecipe,
    remove,
  }
}

export function useCreateRecipe() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: RecipeCreate) => {
    setIsLoading(true)
    setError(null)
    try {
      let result
      if (isDemoMode()) {
        result = await demoApi.createRecipe(data)
      } else {
        result = await api.createRecipe(data)
      }
      return { success: true, recipe: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建失败'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    create,
    isLoading,
    error,
  }
}
