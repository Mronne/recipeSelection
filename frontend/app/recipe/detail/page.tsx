'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import RecipeDetailClient from '../[id]/RecipeDetailClient'

function RecipeDetailInner() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id') || ''
  return <RecipeDetailClient recipeId={recipeId} />
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#868E96]">加载中...</div>}>
      <RecipeDetailInner />
    </Suspense>
  )
}
