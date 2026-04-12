// 本地存储的自定义分类和标签
const STORAGE_KEY_CATEGORIES = 'recipe_custom_categories'
const STORAGE_KEY_TAGS = 'recipe_custom_tags'

// 默认分类
export const DEFAULT_CATEGORIES = [
  '中餐',
  '西餐', 
  '甜点',
  '汤羹',
  '快手菜',
  '家常菜',
  '素食',
  '早餐',
  '午餐',
  '晚餐',
  '夜宵',
  '烘焙',
  '饮品',
  '凉菜',
  '主食',
  '小吃',
]

// 默认标签
export const DEFAULT_TAGS = [
  '辣',
  '清淡',
  '酸甜',
  '咸鲜',
  '健康',
  '低脂',
  '高蛋白',
  '快手',
  '下饭菜',
  '宴客',
  '儿童喜爱',
  '老人适宜',
  '节日',
  '传统',
  '创新',
]

// 获取所有分类（默认 + 自定义）
export function getAllCategories(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  const custom = getCustomCategories()
  return [...DEFAULT_CATEGORIES, ...custom]
}

// 获取所有标签
export function getAllTags(): string[] {
  if (typeof window === 'undefined') return DEFAULT_TAGS
  const custom = getCustomTags()
  return [...DEFAULT_TAGS, ...custom]
}

// 获取自定义分类
export function getCustomCategories(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 获取自定义标签
export function getCustomTags(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY_TAGS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 添加自定义分类
export function addCustomCategory(name: string): boolean {
  if (typeof window === 'undefined') return false
  const custom = getCustomCategories()
  if (custom.includes(name) || DEFAULT_CATEGORIES.includes(name)) {
    return false
  }
  custom.push(name)
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(custom))
  return true
}

// 添加自定义标签
export function addCustomTag(name: string): boolean {
  if (typeof window === 'undefined') return false
  const custom = getCustomTags()
  if (custom.includes(name) || DEFAULT_TAGS.includes(name)) {
    return false
  }
  custom.push(name)
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(custom))
  return true
}

// 删除自定义分类
export function removeCustomCategory(name: string): boolean {
  if (typeof window === 'undefined') return false
  const custom = getCustomCategories()
  const filtered = custom.filter(c => c !== name)
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered))
  return true
}

// 删除自定义标签
export function removeCustomTag(name: string): boolean {
  if (typeof window === 'undefined') return false
  const custom = getCustomTags()
  const filtered = custom.filter(t => t !== name)
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(filtered))
  return true
}
