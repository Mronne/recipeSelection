'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, GripVertical } from 'lucide-react'
import { Ingredient } from '@/types'
import { ALL_INGREDIENTS, UNITS, INGREDIENT_CATEGORIES } from '@/lib/ingredients-data'
import { generateId, cn } from '@/lib/utils'

interface IngredientInputProps { ingredients: Ingredient[]; onChange: (ingredients: Ingredient[]) => void }

export default function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  const addIngredient = () => {
    const newIngredient: Ingredient = { id: generateId(), name: '', amount: 1, unit: '克', category: 'vegetables' }
    onChange([...ingredients, newIngredient])
    setTimeout(() => inputRefs.current[newIngredient.id]?.focus(), 50)
  }

  const removeIngredient = (id: string) => { onChange(ingredients.filter(ing => ing.id !== id)) }
  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    onChange(ingredients.map(ing => ing.id === id ? { ...ing, ...updates } : ing))
  }

  const handleNameChange = (id: string, value: string) => {
    updateIngredient(id, { name: value })
    if (value.trim()) {
      const matches = ALL_INGREDIENTS.filter(ing => ing.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
      setSuggestions(matches); setShowSuggestions(id)
    } else { setShowSuggestions(null) }
    const category = Object.entries(INGREDIENT_CATEGORIES).find(([_, cat]) => cat.items.includes(value))?.[0]
    if (category) updateIngredient(id, { category })
  }

  const selectSuggestion = (ingredientId: string, name: string) => {
    updateIngredient(ingredientId, { name }); setShowSuggestions(null)
    const category = Object.entries(INGREDIENT_CATEGORIES).find(([_, cat]) => cat.items.includes(name))?.[0] || 'other'
    updateIngredient(ingredientId, { category })
  }

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {ingredients.map((ingredient) => (
          <motion.div key={ingredient.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl group">
            <div className="cursor-grab active:cursor-grabbing text-text-tertiary"><GripVertical className="w-4 h-4" /></div>
            <input type="number" value={ingredient.amount} min="0" step="0.5"
              onChange={(e) => updateIngredient(ingredient.id, { amount: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-2 text-center bg-white border border-border rounded-lg text-sm focus:border-primary" />
            <select value={ingredient.unit} onChange={(e) => updateIngredient(ingredient.id, { unit: e.target.value })}
              className="w-20 px-2 py-2 bg-white border border-border rounded-lg text-sm focus:border-primary">
              {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            <div className="flex-1 relative">
              <input ref={el => { if (el) inputRefs.current[ingredient.id] = el }} type="text" value={ingredient.name}
                onChange={(e) => handleNameChange(ingredient.id, e.target.value)} onClick={(e) => e.stopPropagation()}
                placeholder="输入食材名称" className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:border-primary" />
              <AnimatePresence>
                {showSuggestions === ingredient.id && suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={(e) => { e.stopPropagation(); selectSuggestion(ingredient.id, suggestion) }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">{suggestion}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {ingredient.name && (
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: INGREDIENT_CATEGORIES[ingredient.category]?.color || '#ccc' }}
                title={INGREDIENT_CATEGORIES[ingredient.category]?.name} />
            )}
            <button type="button" onClick={() => removeIngredient(ingredient.id)}
              className="p-2 text-text-tertiary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button type="button" onClick={addIngredient} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /><span>添加食材</span>
      </motion.button>
    </div>
  )
}
