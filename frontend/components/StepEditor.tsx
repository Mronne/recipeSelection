'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { Step } from '@/types'
import { generateId, cn } from '@/lib/utils'

interface StepEditorProps { steps: Step[]; onChange: (steps: Step[]) => void }

export default function StepEditor({ steps, onChange }: StepEditorProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const addStep = () => {
    const newStep: Step = { id: generateId(), order: steps.length + 1, description: '' }
    onChange([...steps, newStep]); setExpandedStep(newStep.id)
  }

  const removeStep = (id: string) => {
    const filtered = steps.filter(s => s.id !== id)
    onChange(filtered.map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  const updateStep = (id: string, updates: Partial<Step>) => {
    onChange(steps.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === steps.length - 1) return
    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
    onChange(newSteps.map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {steps.map((step, index) => (
          <motion.div key={step.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }} className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveStep(index, 'up')} disabled={index === 0}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div className="step-number">{step.order}</div>
              {expandedStep === step.id ? (
                <div className="flex-1">
                  <textarea value={step.description} rows={3} autoFocus
                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                    placeholder="描述这一步的操作..."
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:border-primary resize-none" />
                </div>
              ) : (
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedStep(step.id)}>
                  <p className={cn("text-sm", step.description ? "text-text-primary" : "text-text-tertiary")}>
                    {step.description || "点击添加步骤描述..."}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-1">
                {expandedStep === step.id && (
                  <button type="button" onClick={() => setExpandedStep(null)}
                    className="p-2 text-text-secondary hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                )}
                <button type="button" onClick={() => removeStep(step.id)} className="p-2 text-text-tertiary hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <AnimatePresence>
              {expandedStep === step.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3">
                  <div className="flex items-center gap-2 pl-14">
                    <button type="button" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-primary transition-colors">
                      <ImageIcon className="w-4 h-4" /><span>添加图片</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button type="button" onClick={addStep} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /><span>添加步骤</span>
      </motion.button>
    </div>
  )
}
