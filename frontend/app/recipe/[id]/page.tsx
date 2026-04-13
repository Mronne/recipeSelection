import RecipeDetailClient from './RecipeDetailClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function RecipeDetailPage() {
  return <RecipeDetailClient />
}
