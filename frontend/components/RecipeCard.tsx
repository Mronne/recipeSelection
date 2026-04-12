'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Heart } from 'lucide-react'
import { Recipe } from '@/types'
import { formatTime, getDifficultyLabel, getDifficultyColor, cn } from '@/lib/utils'

interface RecipeCardProps { recipe: Recipe; index?: number }

export default function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/recipe/${recipe.id}`}>
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm card-hover cursor-pointer">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image src={recipe.coverImage} alt={recipe.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${getDifficultyColor(recipe.difficulty)}20`, color: getDifficultyColor(recipe.difficulty) }}>
              {getDifficultyLabel(recipe.difficulty)}
            </div>
            <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Heart className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">{recipe.name}</h3>
            <p className="text-sm text-text-secondary mb-3 line-clamp-2">{recipe.description}</p>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{formatTime(recipe.prepTime + recipe.cookTime)}</span></div>
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{recipe.servings}人份</span></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-divider rounded-md text-xs text-text-secondary">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
