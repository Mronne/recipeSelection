'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, X } from 'lucide-react'

interface ImageUploaderProps {
  value?: string
  onChange?: (url: string, file?: File) => void
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isLoading, setIsLoading] = useState(false)

  // 当外部 value 变化时更新 preview
  useEffect(() => {
    if (value) {
      setPreview(value)
    }
  }, [value])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件大小 (限制 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      return
    }

    setIsLoading(true)
    
    // 创建本地预览URL
    const url = URL.createObjectURL(file)
    setPreview(url)
    setIsLoading(false)
    onChange?.(url, file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange?.('', undefined)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="relative w-full h-48 bg-[#F1F3F5] border-2 border-dashed border-[#DEE2E6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#4CAF50] hover:bg-[#E8F5E9] transition-all overflow-hidden group"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-sm text-[#868E96]">加载中...</span>
        </div>
      ) : preview ? (
        <>
          <img 
            src={preview} 
            alt="Preview" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              console.error('Image failed to load:', preview)
              setPreview(null)
            }}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm z-10"
          >
            <X className="w-4 h-4 text-[#495057]" />
          </button>
        </>
      ) : (
        <>
          <Camera className="w-10 h-10 text-[#ADB5BD] group-hover:text-[#4CAF50] transition-colors mb-2" />
          <span className="text-sm text-[#868E96] group-hover:text-[#4CAF50]">
            点击上传图片
          </span>
          <span className="text-xs text-[#ADB5BD] mt-1">
            最大 5MB
          </span>
        </>
      )}
    </div>
  )
}
