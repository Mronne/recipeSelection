'use client'

import { motion } from 'framer-motion'
import { RECIPE_CATEGORIES } from '@/lib/ingredients-data'
import { cn } from '@/lib/utils'

interface TagSelectorProps { selectedTags: string[]; onChange: (tags: string[]) => void }

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) onChange(selectedTags.filter(t => t !== tag))
    else onChange([...selectedTags, tag])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {RECIPE_CATEGORIES.map((tag, index) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <motion.button key={tag} type="button" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.02 }}
            onClick={() => toggleTag(tag)} className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isSelected ? "bg-primary text-white shadow-md" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            )}>
            {tag}
          </motion.button>
        )
      })}
    </div>
  )
}
