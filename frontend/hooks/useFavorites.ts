'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Recipe } from '@/types'
import { canFavorite, isGuest } from '@/lib/auth'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canUseFavorites, setCanUseFavorites] = useState(false)

  useEffect(() => {
    setCanUseFavorites(canFavorite())
  }, [])

  const fetchFavorites = useCallback(async () => {
    if (!canFavorite()) return
    setIsLoading(true)
    try {
      const data = await api.getFavorites()
      setFavorites(data)
    } catch (err) {
      setError('加载收藏失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useCallback((recipeId: string) => {
    if (!canFavorite()) return false
    return favorites.some(f => f.id === recipeId)
  }, [favorites])

  const toggleFavorite = useCallback(async (recipeId: string) => {
    if (!canFavorite()) {
      alert('请先登录账号使用收藏功能')
      return null
    }
    try {
      if (isFavorite(recipeId)) {
        await api.removeFromFavorites(recipeId)
        setFavorites(prev => prev.filter(f => f.id !== recipeId))
        return false
      } else {
        await api.addToFavorites(recipeId)
        await fetchFavorites()
        return true
      }
    } catch (err) {
      console.error('收藏操作失败:', err)
      return null
    }
  }, [isFavorite, fetchFavorites])

  return {
    favorites,
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    canUseFavorites,
    refetch: fetchFavorites,
  }
}
