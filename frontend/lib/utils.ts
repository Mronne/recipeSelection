import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function formatTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours}小时` : `${hours}小时${mins}分钟`
}

export function getDifficultyLabel(d: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[d] || d
}

// Fresh green colors - Recipya style
export function getDifficultyColor(d: string): string {
  const map: Record<string, string> = {
    easy: '#4CAF50',    // Fresh green
    medium: '#FF9800',  // Orange
    hard: '#F44336'     // Red
  }
  return map[d] || '#868E96'
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    '中餐': '#4CAF50',
    '西餐': '#2196F3',
    '甜点': '#E91E63',
    '汤羹': '#00BCD4',
    '快手菜': '#FF9800',
    '家常菜': '#8BC34A',
    '素食': '#9C27B0',
  }
  return map[category] || '#4CAF50'
}
