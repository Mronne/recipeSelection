'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { icon: 24, text: 'text-xl' },
  md: { icon: 32, text: 'text-2xl' },
  lg: { icon: 48, text: 'text-4xl' },
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const { icon, text } = sizes[size]

  return (
    <div className="flex items-center justify-center gap-2">
      {/* 左侧 Logo */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={icon}
        height={icon}
        className="object-contain"
      />
      
      {/* 文字 */}
      {showText && (
        <span className={`font-bold text-[#212529] ${text}`}>王者餐厅</span>
      )}
      
      {/* 右侧 Logo */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={icon}
        height={icon}
        className="object-contain"
      />
    </div>
  )
}
