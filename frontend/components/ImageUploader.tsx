'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, X } from 'lucide-react'

interface ImageUploaderProps {
  value?: string
  onChange?: (url: string, file?: File) => void
}

function resizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'))
            return
          }
          const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Image load failed'))
  })
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (value) {
      setPreview(value)
    }
  }, [value])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const resized = await resizeImage(file)
      const url = URL.createObjectURL(resized)
      setPreview(url)
      onChange?.(url, resized)
    } catch (err) {
      alert('图片处理失败，请重试')
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } finally {
      setIsLoading(false)
    }
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
          <span className="text-sm text-[#868E96]">处理中...</span>
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
            自动压缩，建议上传高清原图
          </span>
        </>
      )}
    </div>
  )
}
