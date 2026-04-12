'use client'

import { motion } from 'framer-motion'
import RecipeCard from './RecipeCard'
import { Recipe } from '@/types'

interface RecipeGridProps { recipes: Recipe[] }

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} />)}
    </motion.div>
  )
}
