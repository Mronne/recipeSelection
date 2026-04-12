'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Moon, Sun, Trash2, LogOut, User, Tags, FolderOpen, 
  Plus, X, Camera, Loader2 
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import AvatarCropper from '@/components/AvatarCropper'
import { api } from '@/lib/api'
import { clearToken } from '@/lib/auth'
import { 
  getAllCategories, 
  getAllTags, 
  addCustomCategory, 
  addCustomTag,
  removeCustomCategory,
  removeCustomTag,
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS
} from '@/lib/categories-data'
import type { User as UserType } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newTag, setNewTag] = useState('')
  
  const [user, setUser] = useState<UserType | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)

  useEffect(() => {
    setCategories(getAllCategories())
    setTags(getAllTags())
    loadUser()
  }, [])

  const loadUser = async () => {
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    if (isGuest) {
      setUser({
        id: 'guest',
        username: '游客',
        email: '',
        fullName: '游客',
      } as UserType)
      return
    }
    
    try {
      const userData = await api.getCurrentUser()
      setUser(userData)
      // 构建头像URL，添加时间戳避免缓存
      if (userData.id) {
        const timestamp = Date.now()
        setAvatarUrl(`/api/users/${userData.id}/image?t=${timestamp}`)
      }
    } catch {
      // 未登录状态
    }
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearToken()
      localStorage.removeItem('guest_mode')
      localStorage.removeItem('current_user')
      window.location.href = '/login'
    }
  }

  const clearData = () => {
    if (confirm('确定要清除所有本地数据吗？')) {
      localStorage.clear()
      alert('数据已清除')
      router.push('/')
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    if (addCustomCategory(newCategory.trim())) {
      setCategories(getAllCategories())
      setNewCategory('')
    } else {
      alert('该分类已存在')
    }
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (addCustomTag(newTag.trim())) {
      setTags(getAllTags())
      setNewTag('')
    } else {
      alert('该标签已存在')
    }
  }

  const handleRemoveCategory = (name: string) => {
    if (DEFAULT_CATEGORIES.includes(name)) {
      alert('默认分类不能删除')
      return
    }
    if (confirm(`确定要删除分类"${name}"吗？`)) {
      removeCustomCategory(name)
      setCategories(getAllCategories())
    }
  }

  const handleRemoveTag = (name: string) => {
    if (DEFAULT_TAGS.includes(name)) {
      alert('默认标签不能删除')
      return
    }
    if (confirm(`确定要删除标签"${name}"吗？`)) {
      removeCustomTag(name)
      setTags(getAllTags())
    }
  }

  const handleAvatarClick = () => {
    if (isGuestMode) {
      alert('游客模式无法上传头像')
      return
    }
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // 读取文件为DataURL，打开裁剪界面
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
    
    // 清空input，允许重复选择同一文件
    e.target.value = ''
  }

  const handleCropConfirm = async (croppedBlob: Blob) => {
    if (!user?.id) return

    setIsUploading(true)
    setCropImage(null)
    
    try {
      // 将blob转换为file
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
      await api.uploadUserAvatar(user.id, file)
      
      // 刷新头像URL（强制刷新缓存）
      const timestamp = Date.now()
      setAvatarUrl(`/api/users/${user.id}/image?t=${timestamp}`)
      alert('头像上传成功！')
    } catch (err) {
      console.error('Upload error:', err)
      alert('头像上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCropCancel = () => {
    setCropImage(null)
  }

  const isGuestMode = typeof window !== 'undefined' && localStorage.getItem('guest_mode') === 'true'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      
      {/* Avatar Cropper Modal */}
      {cropImage && (
        <AvatarCropper 
          image={cropImage} 
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
      
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0">
        <header className="bg-white border-b border-[#E9ECEF] px-4 py-4">
          <h1 className="text-xl font-bold">设置</h1>
        </header>

        <div className="px-4 py-6 max-w-2xl">
          {/* Account */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] mb-4">
            <div className="p-4 border-b border-[#E9ECEF]">
              <h2 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                账号
              </h2>
            </div>
            <div className="p-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <button 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="relative w-28 h-28 rounded-full bg-[#E8F5E9] flex items-center justify-center overflow-hidden group disabled:cursor-not-allowed border-2 border-[#4CAF50]/20 hover:border-[#4CAF50] transition-colors"
                >
                  {avatarUrl && !isGuestMode ? (
                    <img 
                      src={avatarUrl} 
                      alt="头像" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Avatar load error')
                        setAvatarUrl('')
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#4CAF50]" />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <div className="text-center text-white">
                        <Camera className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">点击更换</span>
                      </div>
                    )}
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-sm text-[#868E96] mt-3">
                  {isGuestMode 
                    ? '游客模式无法上传头像' 
                    : avatarUrl 
                      ? '点击头像进行裁剪和更换' 
                      : '点击头像上传头像'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#495057]">用户名</span>
                  <span className="font-medium">{user?.username || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#495057]">邮箱</span>
                  <span className="font-medium">{user?.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#495057]">当前模式</span>
                  <span className={`font-medium ${isGuestMode ? 'text-[#868E96]' : 'text-[#4CAF50]'}`}>
                    {isGuestMode ? '游客模式' : '已登录'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] mb-4">
            <div className="p-4 border-b border-[#E9ECEF]">
              <h2 className="font-semibold flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                分类管理
              </h2>
            </div>
            <div className="p-4">
              {/* Add new category */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="添加新分类..."
                  className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#43A047] disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {/* Category list */}
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                      DEFAULT_CATEGORIES.includes(cat)
                        ? 'bg-[#E8F5E9] text-[#4CAF50]'
                        : 'bg-[#F1F3F5] text-[#495057]'
                    }`}
                  >
                    {cat}
                    {!DEFAULT_CATEGORIES.includes(cat) && (
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="ml-1 p-0.5 hover:bg-[#FFEBEE] rounded"
                      >
                        <X className="w-3 h-3 text-[#F44336]" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#868E96] mt-2">
                绿色为默认分类，灰色为自定义分类（可删除）
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] mb-4">
            <div className="p-4 border-b border-[#E9ECEF]">
              <h2 className="font-semibold flex items-center gap-2">
                <Tags className="w-5 h-5" />
                标签管理
              </h2>
            </div>
            <div className="p-4">
              {/* Add new tag */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加新标签..."
                  className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg focus:border-[#4CAF50] outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#43A047] disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {/* Tag list */}
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                      DEFAULT_TAGS.includes(tag)
                        ? 'bg-[#E8F5E9] text-[#4CAF50]'
                        : 'bg-[#F1F3F5] text-[#495057]'
                    }`}
                  >
                    {tag}
                    {!DEFAULT_TAGS.includes(tag) && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 p-0.5 hover:bg-[#FFEBEE] rounded"
                      >
                        <X className="w-3 h-3 text-[#F44336]" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#868E96] mt-2">
                绿色为默认标签，灰色为自定义标签（可删除）
              </p>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] mb-4">
            <div className="p-4 border-b border-[#E9ECEF]">
              <h2 className="font-semibold">外观</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#495057]">主题</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-[#E8F5E9] text-[#4CAF50] rounded-lg">
                    <Sun className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[#868E96] hover:bg-[#F8F9FA] rounded-lg">
                    <Moon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] mb-4">
            <div className="p-4 border-b border-[#E9ECEF]">
              <h2 className="font-semibold">数据</h2>
            </div>
            <div className="p-4">
              <button 
                onClick={clearData}
                className="flex items-center gap-2 text-[#F44336] py-2"
              >
                <Trash2 className="w-5 h-5" />
                清除所有数据
              </button>
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-[#E9ECEF] rounded-xl text-[#F44336] font-semibold hover:bg-[#FFEBEE] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </main>
    </div>
  )
}
