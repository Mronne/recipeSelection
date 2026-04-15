'use client'

import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export default function Logo({ width = 200, height = 60, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="裕厨华餐"
      width={width}
      height={height}
      className={`object-contain w-auto h-auto ${className}`}
      style={{ maxWidth: width, maxHeight: height }}
      priority
    />
  )
}
