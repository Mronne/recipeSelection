// 智能食谱解析器 - 从文本中自动提取食材和步骤

export interface ParsedIngredient {
  name: string
  amount: number
  unit: string
}

export interface ParsedStep {
  order: number
  description: string
}

export interface ParsedRecipe {
  name: string
  description: string
  ingredients: ParsedIngredient[]
  steps: ParsedStep[]
  prepTime: number
  cookTime: number
  servings: number
}

// 常用单位列表
const UNITS = [
  '克', 'g', '千克', 'kg', '斤', '两',
  '毫升', 'ml', '升', 'l', 'L',
  '个', '只', '条', '根', '片', '块', '勺', '茶匙', '汤匙', '杯',
  '把', '瓣', '粒', '颗', '段', '寸',
  '适量', '少许', '少量', '一些', '大量', '足量',
  '茶匙', '汤匙', '大勺', '小勺'
]

// 时间相关词汇
const TIME_PATTERNS = [
  { pattern: /(\d+)\s*分钟?/g, unit: 1 },
  { pattern: /(\d+)\s*小时?/g, unit: 60 },
  { pattern: /半小时/g, unit: 30 },
  { pattern: /一刻钟/g, unit: 15 },
]

// 份量相关
const SERVING_PATTERNS = [
  /(\d+)\s*人份/,
  /(\d+)\s*人量/,
  /适合\s*(\d+)\s*人/,
  /(\d+)\s*人[食吃]/,
]

/**
 * 智能解析食谱文本
 */
export function parseRecipeText(text: string): Partial<ParsedRecipe> {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  const result: Partial<ParsedRecipe> = {
    name: '',
    description: '',
    ingredients: [],
    steps: [],
    prepTime: 15,
    cookTime: 30,
    servings: 2,
  }

  // 解析食材部分
  const ingredientSection = extractSection(lines, ['食材', '原料', '材料', '配料'])
  if (ingredientSection.length > 0) {
    result.ingredients = parseIngredients(ingredientSection)
  }

  // 解析步骤部分
  const stepSection = extractSection(lines, ['步骤', '做法', '制作', '烹饪', '做法：', '步骤：'])
  if (stepSection.length > 0) {
    result.steps = parseSteps(stepSection)
  }

  // 如果没有明确分区，尝试智能识别
  if ((!result.ingredients || result.ingredients.length === 0) && 
      (!result.steps || result.steps.length === 0)) {
    const { ingredients, steps } = smartParse(lines)
    result.ingredients = ingredients
    result.steps = steps
  }

  // 提取时间和份量
  const timeInfo = extractTimeInfo(text)
  result.prepTime = timeInfo.prepTime
  result.cookTime = timeInfo.cookTime
  result.servings = extractServings(text)

  // 提取菜名（第一行或包含"菜名"、"名称"的行）
  result.name = extractDishName(lines, text)
  
  // 提取描述（第二行或简短描述）
  result.description = extractDescription(lines, result.name)

  return result
}

/**
 * 从文本中提取特定部分
 */
function extractSection(lines: string[], keywords: string[]): string[] {
  const result: string[] = []
  let inSection = false
  
  for (const line of lines) {
    // 检查是否是当前部分的开始
    const isStart = keywords.some(kw => 
      line.includes(kw) && (line.length < 20 || line.includes(':') || line.includes('：'))
    )
    
    if (isStart) {
      inSection = true
      // 如果这一行有内容（除了标题），也加入
      const content = line.replace(new RegExp(keywords.join('|'), 'g'), '').replace(/[:：]/g, '').trim()
      if (content && content.length > 0 && content.length < 50) {
        result.push(content)
      }
      continue
    }
    
    // 检查是否是其他部分的开始（停止当前部分）
    const isOtherSection = ['食材', '原料', '材料', '配料', '步骤', '做法', '制作', '烹饪', '小贴士', '提示'].some(kw => 
      line.includes(kw) && !keywords.includes(kw) && (line.length < 20 || line.includes(':') || line.includes('：'))
    )
    
    if (isOtherSection && inSection) {
      inSection = false
      continue
    }
    
    if (inSection && line.length > 0) {
      result.push(line)
    }
  }
  
  return result
}

/**
 * 解析食材列表
 */
function parseIngredients(lines: string[]): ParsedIngredient[] {
  const ingredients: ParsedIngredient[] = []
  
  for (const line of lines) {
    // 去除序号标记
    const cleanLine = line.replace(/^\d+[.．、,，\s)）]+/, '').trim()
    if (!cleanLine) continue
    
    const parsed = parseIngredientLine(cleanLine)
    if (parsed) {
      ingredients.push(parsed)
    }
  }
  
  return ingredients
}

/**
 * 解析单行食材
 */
function parseIngredientLine(line: string): ParsedIngredient | null {
  // 匹配模式: 食材名 数量 单位
  // 如: "猪肉 500克", "鸡蛋 2个", "盐 适量"
  
  // 尝试匹配 "名称 数量+单位" 格式
  const match1 = line.match(/^([^\d]+)\s*(\d*\.?\d+)\s*([\u4e00-\u9fa5a-zA-Z]+)$/)
  if (match1) {
    const [, name, amount, unit] = match1
    return {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      unit: unit.trim(),
    }
  }
  
  // 尝试匹配 "名称: 数量+单位" 格式
  const match2 = line.match(/^([^:]+)[:：]\s*(\d*\.?\d*)\s*([\u4e00-\u9fa5a-zA-Z]*)$/)
  if (match2) {
    const [, name, amount, unit] = match2
    return {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      unit: unit.trim() || '适量',
    }
  }
  
  // 尝试匹配 "数量+单位 名称" 格式（如 "500克猪肉"）
  const match3 = line.match(/^(\d*\.?\d+)\s*([\u4e00-\u9fa5a-zA-Z]+)\s+(.+)$/)
  if (match3) {
    const [, amount, unit, name] = match3
    return {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      unit: unit.trim(),
    }
  }
  
  // 如果没有匹配到数字，整行作为食材名，用量适量
  if (line.length > 0 && line.length < 20) {
    return {
      name: line,
      amount: 0,
      unit: '适量',
    }
  }
  
  return null
}

/**
 * 解析步骤
 */
function parseSteps(lines: string[]): ParsedStep[] {
  const steps: ParsedStep[] = []
  let order = 1
  
  for (const line of lines) {
    // 检查是否以序号开头
    const stepMatch = line.match(/^(\d+)[.．、,，\s)）]+(.+)$/)
    
    if (stepMatch) {
      steps.push({
        order: parseInt(stepMatch[1]),
        description: stepMatch[2].trim(),
      })
    } else if (line.length > 10) {
      // 没有序号但内容较长，可能是步骤描述
      steps.push({
        order: order,
        description: line,
      })
    }
    order++
  }
  
  // 重新排序
  return steps.sort((a, b) => a.order - b.order).map((s, i) => ({ ...s, order: i + 1 }))
}

/**
 * 智能解析（没有明确分区时）
 */
function smartParse(lines: string[]): { ingredients: ParsedIngredient[], steps: ParsedStep[] } {
  const ingredients: ParsedIngredient[] = []
  const steps: ParsedStep[] = []
  
  for (const line of lines) {
    const cleanLine = line.replace(/^\d+[.．、,，\s)）]+/, '').trim()
    
    // 判断是食材还是步骤
    // 食材特征: 较短，包含数量单位
    // 步骤特征: 较长，包含动作词
    
    const hasNumber = /\d/.test(cleanLine)
    const hasUnit = UNITS.some(u => cleanLine.includes(u))
    const isShort = cleanLine.length < 30
    const hasActionWord = /[切洗炒煮炸煎烤蒸拌腌炖焖]/g.test(cleanLine)
    
    if (isShort && hasNumber && hasUnit && !hasActionWord) {
      // 可能是食材
      const parsed = parseIngredientLine(cleanLine)
      if (parsed) {
        ingredients.push(parsed)
      }
    } else if (cleanLine.length > 15 || hasActionWord) {
      // 可能是步骤
      steps.push({
        order: steps.length + 1,
        description: cleanLine,
      })
    }
  }
  
  return { ingredients, steps }
}

/**
 * 提取时间信息
 */
function extractTimeInfo(text: string): { prepTime: number, cookTime: number } {
  let totalMinutes = 30 // 默认30分钟
  
  for (const { pattern, unit } of TIME_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const minutes = parseInt(match[1]) * unit
      if (minutes > totalMinutes) {
        totalMinutes = minutes
      }
    }
  }
  
  // 简单分配：准备时间占1/3，烹饪时间占2/3
  return {
    prepTime: Math.round(totalMinutes / 3),
    cookTime: Math.round(totalMinutes * 2 / 3),
  }
}

/**
 * 提取份量
 */
function extractServings(text: string): number {
  for (const pattern of SERVING_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return parseInt(match[1])
    }
  }
  return 2 // 默认2人份
}

/**
 * 提取菜名
 */
function extractDishName(lines: string[], fullText: string): string {
  // 查找包含"菜名"、"名称"、"菜"的行
  for (const line of lines.slice(0, 5)) {
    const nameMatch = line.match(/(?:菜名|名称|菜)[:：]\s*(.+)/)
    if (nameMatch) {
      return nameMatch[1].trim()
    }
  }
  
  // 返回第一行（如果不是太长）
  const firstLine = lines[0]
  if (firstLine && firstLine.length < 20 && !firstLine.includes('：') && !firstLine.includes(':')) {
    return firstLine
  }
  
  return ''
}

/**
 * 提取描述
 */
function extractDescription(lines: string[], name: string): string {
  // 查找简短描述（非食材非步骤的行）
  for (const line of lines.slice(1, 5)) {
    if (line.length > 10 && line.length < 100 && 
        !line.includes('食材') && !line.includes('步骤') && 
        !line.includes('做法') && !/\d+\s*克/.test(line)) {
      return line
    }
  }
  return ''
}
