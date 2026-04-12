// 权限管理

export type UserRole = 'admin' | 'user' | 'guest'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
  token?: string
}

// 获取当前用户
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  // 检查是否是演示模式（管理员）
  const isDemo = localStorage.getItem('demo_mode') === 'true'
  if (isDemo) {
    return {
      id: 'demo',
      username: '演示管理员',
      email: 'admin@example.com',
      role: 'admin', // 演示模式为管理员
    }
  }
  
  // 检查游客模式
  const isGuestMode = localStorage.getItem('guest_mode') === 'true'
  if (isGuestMode) {
    return {
      id: 'guest',
      username: '游客',
      email: '',
      role: 'guest',
    }
  }
  
  // 从localStorage获取用户信息
  const userStr = localStorage.getItem('current_user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  
  return null
}

// 设置当前用户
export function setCurrentUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('current_user')
  }
}

// 检查是否为管理员
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

// 检查是否已登录（非游客）
export function isLoggedIn(): boolean {
  const user = getCurrentUser()
  return user !== null && user.role !== 'guest'
}

// 检查是否为游客
export function isGuest(): boolean {
  const user = getCurrentUser()
  return user?.role === 'guest' || user === null
}

// 检查是否可以查看购物清单
export function canViewShoppingList(): boolean {
  return isAdmin() // 只有管理员可以查看购物清单
}

// 检查是否可以生成购物清单
export function canGenerateShoppingList(): boolean {
  return isAdmin() || isLoggedIn() // 管理员和普通用户可以生成
}

// 检查是否可以收藏
export function canFavorite(): boolean {
  return isLoggedIn() || isAdmin() // 登录用户和管理员可以收藏
}

// 获取用户角色显示文本
export function getRoleDisplay(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: '管理员',
    user: '普通用户',
    guest: '游客',
  }
  return map[role]
}

// 创建管理员账号（用于演示）
export function createAdminUser(): AuthUser {
  return {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  }
}

// 创建普通用户
export function createRegularUser(username: string, email: string): AuthUser {
  return {
    id: `user-${Date.now()}`,
    username,
    email,
    role: 'user',
  }
}

// 创建游客用户
export function createGuestUser(): AuthUser {
  return {
    id: `guest-${Date.now()}`,
    username: '游客',
    email: '',
    role: 'guest',
  }
}
