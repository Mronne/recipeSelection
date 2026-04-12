'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { TIME_OPTIONS } from '@/lib/ingredients-data'
import { cn } from '@/lib/utils'

interface DurationPickerProps { value: number; onChange: (value: number) => void; label: string }

export default function DurationPicker({ value, onChange, label }: DurationPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {TIME_OPTIONS.map((option) => (
          <motion.button key={option.value} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option.value)} className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
              value === option.value ? "bg-primary text-white shadow-md" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            )}>
            <Clock className="w-4 h-4" />{option.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
