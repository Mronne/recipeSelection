import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '裕厨华餐 - Yus Kitchen and Huas Table',
  description: '简洁优雅的中餐食谱管理应用，记录和分享您的美食创作',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
