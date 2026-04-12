'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

interface AvatarCropperProps {
  image: string
  onCancel: () => void
  onConfirm: (croppedImage: Blob) => void
}

export default function AvatarCropper({ image, onCancel, onConfirm }: AvatarCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load image
  useEffect(() => {
    const imageObj = new Image()
    imageObj.crossOrigin = 'anonymous'
    imageObj.onload = () => {
      setImg(imageObj)
      // Center the image initially
      setPosition({ x: 0, y: 0 })
    }
    imageObj.src = image
  }, [image])

  // Draw canvas
  useEffect(() => {
    if (!img || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Create circular clipping path
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Draw background
    ctx.fillStyle = '#E8F5E9'
    ctx.fillRect(0, 0, size, size)

    // Calculate image dimensions
    const imgAspect = img.width / img.height
    let drawWidth = size
    let drawHeight = size / imgAspect

    if (drawHeight < size) {
      drawHeight = size
      drawWidth = size * imgAspect
    }

    // Apply scale
    drawWidth *= scale
    drawHeight *= scale

    // Calculate position
    const x = size / 2 - drawWidth / 2 + position.x
    const y = size / 2 - drawHeight / 2 + position.y

    // Draw image with rotation
    ctx.translate(size / 2, size / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-size / 2, -size / 2)
    ctx.drawImage(img, x, y, drawWidth, drawHeight)

    ctx.restore()

    // Draw border
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [img, scale, rotation, position])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }, [position])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5))
  const handleRotate = () => setRotation(r => (r + 90) % 360)
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleConfirm = async () => {
    if (!canvasRef.current) return

    setIsProcessing(true)
    try {
      // Create output canvas at 256x256
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = 256
      outputCanvas.height = 256
      const outputCtx = outputCanvas.getContext('2d')
      if (!outputCtx) throw new Error('Failed to get context')

      // Draw from preview canvas
      outputCtx.drawImage(canvasRef.current, 0, 0, 256, 256)

      // Convert to blob
      outputCanvas.toBlob((blob) => {
        if (blob) {
          onConfirm(blob)
        }
      }, 'image/jpeg', 0.9)
    } catch (err) {
      console.error('Crop failed:', err)
      alert('图片处理失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#212529]">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-[#4CAF50] rounded-full"></span>
          裁剪头像
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preview Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 bg-[#1a1a1a]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className={`rounded-full cursor-move shadow-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ touchAction: 'none' }}
          />
          <p className="text-white/50 text-sm text-center mt-4">
            拖动移动 · 缩放调整大小
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#212529] px-4 py-4 space-y-4">
        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleZoomOut}
            className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-white/60 text-xs mb-1">缩放</span>
            <span className="text-white font-medium">{Math.round(scale * 100)}%</span>
          </div>
          <button
            onClick={handleZoomIn}
            className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleRotate}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            旋转 90°
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 py-3.5 bg-[#4CAF50] text-white rounded-xl font-medium hover:bg-[#43A047] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                确认使用
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
