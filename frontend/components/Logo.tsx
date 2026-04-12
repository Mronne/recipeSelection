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
      alt="王者餐厅"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  )
}
