'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import EditRecipeClient from '../[id]/edit/EditRecipeClient'

function RecipeEditInner() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id') || ''
  return <EditRecipeClient recipeId={recipeId} />
}

export default function RecipeEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#868E96]">加载中...</div>}>
      <RecipeEditInner />
    </Suspense>
  )
}
