'use client'

import { motion } from 'framer-motion'
import { DIFFICULTY_OPTIONS } from '@/lib/ingredients-data'
import { cn } from '@/lib/utils'

interface DifficultySelectorProps { value: 'easy' | 'medium' | 'hard'; onChange: (value: 'easy' | 'medium' | 'hard') => void }

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">难度</label>
      <div className="flex gap-3">
        {DIFFICULTY_OPTIONS.map((option) => (
          <motion.button key={option.value} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option.value as 'easy' | 'medium' | 'hard')} className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              value === option.value ? "shadow-md text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            )} style={{ backgroundColor: value === option.value ? option.color : undefined }}>
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
