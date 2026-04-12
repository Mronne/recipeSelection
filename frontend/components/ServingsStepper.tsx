'use client'

import { motion } from 'framer-motion'
import { Minus, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServingsStepperProps { value: number; onChange: (value: number) => void }

export default function ServingsStepper({ value, onChange }: ServingsStepperProps) {
  const decrement = () => { if (value > 1) onChange(value - 1) }
  const increment = () => { if (value < 20) onChange(value + 1) }

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">份量</label>
      <div className="flex items-center gap-3">
        <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={decrement} disabled={value <= 1}
          className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", value <= 1 ? "bg-gray-100 text-text-tertiary cursor-not-allowed" : "bg-gray-100 text-text-primary hover:bg-gray-200")}>
          <Minus className="w-4 h-4" />
        </motion.button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg min-w-[100px] justify-center">
          <Users className="w-4 h-4 text-text-secondary" />
          <span className="text-lg font-semibold text-text-primary">{value}</span>
          <span className="text-sm text-text-secondary">人份</span>
        </div>
        <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={increment} disabled={value >= 20}
          className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", value >= 20 ? "bg-gray-100 text-text-tertiary cursor-not-allowed" : "bg-gray-100 text-text-primary hover:bg-gray-200")}>
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}
