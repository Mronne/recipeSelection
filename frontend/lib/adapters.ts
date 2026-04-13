import type { Recipe, RecipeCreate, MealieRecipe, MealieIngredient, Ingredient } from '@/types'

// ==================== 食材中英文映射表 ====================

const INGREDIENT_TO_ENGLISH: Record<string, string> = {
  // 蔬菜
  '白菜': 'Chinese cabbage', '菠菜': 'spinach', '油菜': 'rapeseed', '芹菜': 'celery',
  '韭菜': 'Chinese chive', '黄瓜': 'cucumber', '西红柿': 'tomato', '番茄': 'tomato',
  '茄子': 'eggplant', '土豆': 'potato', '马铃薯': 'potato', '胡萝卜': 'carrot',
  '洋葱': 'onion', '青椒': 'green pepper', '辣椒': 'chili pepper', '红椒': 'red pepper',
  '大蒜': 'garlic', '生姜': 'ginger', '姜': 'ginger', '葱': 'scallion', '小葱': 'scallion',
  '香菜': 'coriander', '生菜': 'lettuce', '西兰花': 'broccoli', '花菜': 'cauliflower',
  '菜花': 'cauliflower', '冬瓜': 'winter melon', '南瓜': 'pumpkin', '丝瓜': 'loofah',
  '苦瓜': 'bitter melon', '豆角': 'green beans', '豌豆': 'peas', '玉米': 'corn',
  
  // 肉类
  '猪肉': 'pork', '五花肉': 'pork belly', '瘦肉': 'lean pork', '排骨': 'pork ribs',
  '牛肉': 'beef', '牛腩': 'beef brisket', '牛排': 'beef steak', '羊肉': 'lamb',
  '鸡肉': 'chicken', '鸡胸肉': 'chicken breast', '鸡腿': 'chicken leg',
  '鸡翅': 'chicken wing', '鸭肉': 'duck', '培根': 'bacon', '火腿': 'ham',
  '香肠': 'sausage', '腊肉': 'cured pork',
  
  // 海鲜
  '鱼': 'fish', '鲫鱼': 'crucian carp', '草鱼': 'grass carp', '鲈鱼': 'perch',
  '虾': 'shrimp', '虾仁': 'shrimp meat', '螃蟹': 'crab', '蛤蜊': 'clam',
  '扇贝': 'scallop', '鱿鱼': 'squid', '墨鱼': 'cuttlefish', '海参': 'sea cucumber',
  '海带': 'kelp', '紫菜': 'nori',
  
  // 蛋奶
  '鸡蛋': 'egg', '鸭蛋': 'duck egg', '鹌鹑蛋': 'quail egg', '牛奶': 'milk',
  '酸奶': 'yogurt', '奶油': 'cream', '黄油': 'butter', '奶酪': 'cheese',
  
  // 豆制品
  '豆腐': 'tofu', '嫩豆腐': 'soft tofu', '老豆腐': 'firm tofu',
  '豆腐干': 'dried tofu', '豆腐皮': 'tofu skin', '腐竹': 'dried tofu stick',
  '豆浆': 'soy milk', '豆芽': 'bean sprout',
  
  // 菌菇
  '香菇': 'shiitake mushroom', '平菇': 'oyster mushroom', '金针菇': 'enoki mushroom',
  '杏鲍菇': 'king oyster mushroom', '木耳': 'wood ear', '银耳': 'white fungus',
  '蘑菇': 'mushroom',
  
  // 调料
  '盐': 'salt', '糖': 'sugar', '白糖': 'white sugar', '冰糖': 'rock sugar',
  '红糖': 'brown sugar', '生抽': 'light soy sauce', '老抽': 'dark soy sauce',
  '酱油': 'soy sauce', '蚝油': 'oyster sauce', '醋': 'vinegar', '料酒': 'cooking wine',
  '香油': 'sesame oil', '花椒': 'Sichuan pepper', '八角': 'star anise',
  '桂皮': 'cinnamon', '香叶': 'bay leaf', '胡椒粉': 'pepper powder',
  '淀粉': 'starch', '生粉': 'cornstarch', '鸡精': 'chicken essence',
  '味精': 'MSG', '豆瓣酱': 'broad bean paste', '甜面酱': 'sweet bean paste',
  '番茄酱': 'ketchup', '辣椒酱': 'chili sauce', '芝麻酱': 'sesame paste',
  
  // 主食
  '大米': 'rice', '米饭': 'rice', '糯米': 'glutinous rice', '面粉': 'flour',
  '面条': 'noodles', '饺子皮': 'dumpling wrapper', '馄饨皮': 'wonton wrapper',
  '粉丝': 'vermicelli', '粉条': 'glass noodles', '年糕': 'rice cake',
  '馒头': 'steamed bun', '面包': 'bread',
  
  // 水果
  '苹果': 'apple', '梨': 'pear', '香蕉': 'banana', '橙子': 'orange',
  '柠檬': 'lemon', '草莓': 'strawberry', '葡萄': 'grape', '西瓜': 'watermelon',
  '哈密瓜': 'hami melon', '桃子': 'peach', '李子': 'plum', '樱桃': 'cherry',
  '枣': 'jujube', '红枣': 'red date', '桂圆': 'longan', '荔枝': 'lychee',
  '枸杞': 'goji berry',
  
  // 坚果
  '花生': 'peanut', '核桃': 'walnut', '杏仁': 'almond', '腰果': 'cashew',
  '芝麻': 'sesame', '瓜子': 'melon seeds', '松仁': 'pine nut',
}

// 反向映射：英文 -> 中文
const ENGLISH_TO_CHINESE: Record<string, string> = Object.fromEntries(
  Object.entries(INGREDIENT_TO_ENGLISH).map(([cn, en]) => [en.toLowerCase(), cn])
)

// 常见英文食材名映射
const COMMON_ENGLISH_INGREDIENTS: Record<string, string> = {
  'pork': '猪肉', 'beef': '牛肉', 'chicken': '鸡肉', 'fish': '鱼',
  'egg': '鸡蛋', 'rice': '大米', 'onion': '洋葱', 'garlic': '大蒜',
  'ginger': '生姜', 'carrot': '胡萝卜', 'potato': '土豆', 'tomato': '西红柿',
  'cucumber': '黄瓜', 'pepper': '辣椒', 'mushroom': '蘑菇', 'tofu': '豆腐',
  'salt': '盐', 'sugar': '糖', 'oil': '油', 'vinegar': '醋',
  'soy sauce': '酱油', 'water': '水', 'flour': '面粉', 'milk': '牛奶',
}

// ==================== 单位映射 ====================

const UNIT_TO_BACKEND: Record<string, string> = {
  '克': 'g', '千克': 'kg', '公斤': 'kg', '斤': 'jin',
  '毫升': 'ml', '升': 'l', '公升': 'l',
  '个': 'piece', '只': 'piece', '根': 'stick', '片': 'slice',
  '勺': 'spoon', '汤匙': 'tbsp', '茶匙': 'tsp', '杯': 'cup',
  '把': 'handful', '块': 'chunk', '条': 'strip', '适量': 'to taste',
}

const UNIT_FROM_BACKEND: Record<string, string> = {
  'g': '克', 'kg': '千克', 'jin': '斤',
  'ml': '毫升', 'l': '升', 'liter': '升',
  'piece': '个', 'stick': '根', 'slice': '片',
  'spoon': '勺', 'tbsp': '汤匙', 'tsp': '茶匙', 'cup': '杯',
  'handful': '把', 'chunk': '块', 'strip': '条',
  'to taste': '适量', 'pinch': '少许',
}

// ==================== 食材转换函数 ====================

/**
 * 中文食材名转英文（发送到后端）
 */
export function toBackendIngredient(chineseName: string): string {
  const english = INGREDIENT_TO_ENGLISH[chineseName]
  if (english) return english
  
  // 如果没有映射，尝试去除常见修饰词后匹配
  const simplified = chineseName
    .replace(/新鲜/g, '')
    .replace(/冷冻/g, '')
    .replace(/干/g, '')
    .trim()
  
  const mapped = INGREDIENT_TO_ENGLISH[simplified]
  if (mapped) return mapped
  
  // 仍未找到，直接返回原名
  return chineseName
}

/**
 * 英文食材名转中文（从后端接收）
 */
export function fromBackendIngredient(englishName: string): string {
  const lowerName = englishName.toLowerCase().trim()
  
  // 直接匹配
  const chinese = ENGLISH_TO_CHINESE[lowerName] || COMMON_ENGLISH_INGREDIENTS[lowerName]
  if (chinese) return chinese
  
  // 尝试部分匹配
  for (const [en, cn] of Object.entries(COMMON_ENGLISH_INGREDIENTS)) {
    if (lowerName.includes(en)) return cn
  }
  
  for (const [en, cn] of Object.entries(ENGLISH_TO_CHINESE)) {
    if (lowerName.includes(en)) return cn
  }
  
  // 未找到映射，返回原名
  return englishName
}

// ==================== 单位转换函数 ====================

export function toBackendUnit(chineseUnit: string): string {
  return UNIT_TO_BACKEND[chineseUnit] || chineseUnit
}

export function fromBackendUnit(backendUnit: string): string {
  return UNIT_FROM_BACKEND[backendUnit] || backendUnit
}

// ==================== 食谱数据适配器 ====================

/**
 * 后端食谱数据 -> 前端格式
 */
export function fromBackendRecipe(backend: MealieRecipe): Recipe {
  const totalMinutes = parseTime(backend.totalTime) || 
    (parseTime(backend.prepTime) || 0) + (parseTime(backend.performTime) || 0)
  
  return {
    id: backend.id,
    slug: backend.slug || backend.id,  // 如果没有 slug 用 id 代替
    name: backend.name,
    description: backend.description || '',
    coverImage: backend.id 
      ? `/api/media/recipes/${backend.id}/images/original.webp${backend.image ? '?c=' + backend.image : ''}`
      : '/images/recipe-placeholder.svg',
    prepTime: parseTime(backend.prepTime) || 0,
    cookTime: parseTime(backend.performTime) || 0,
    servings: parseServings(backend.recipeYield) || 2,
    difficulty: inferDifficulty(totalMinutes) || 'medium',
    ingredients: (backend.recipeIngredient || []).map(fromBackendIngredientItem),
    steps: (backend.recipeInstructions || []).map((inst, index) => ({
      id: inst.id || String(index + 1),
      order: index + 1,
      description: inst.text,
      image: undefined,
    })),
    tags: (backend.tags || []).map(t => fromBackendCategory(t.name)),
    category: (backend.recipeCategory?.[0]?.name) || '中餐',
    createdAt: backend.dateAdded,
    updatedAt: backend.dateUpdated,
  }
}

/**
 * 前端食谱数据 -> 后端格式
 */
export function toBackendRecipe(frontend: RecipeCreate): Partial<MealieRecipe> {
  return {
    name: frontend.name,
    description: frontend.description,
    recipeYield: `${frontend.servings} 人份`,
    prepTime: formatTime(frontend.prepTime),
    performTime: formatTime(frontend.cookTime),
    recipeIngredient: frontend.ingredients.map(toBackendIngredientItem),
    recipeInstructions: frontend.steps.map((step) => ({
      text: step.description,
      title: null,
      ingredient_references: [],
    })),
    tags: frontend.tags.map(name => ({ name, slug: '' })),
    recipeCategory: frontend.category ? [{ name: frontend.category, slug: '' }] : [],
  }
}

/**
 * 后端食材项 -> 前端格式
 */
function fromBackendIngredientItem(ing: MealieIngredient): Ingredient {
  const foodName = ing.food?.name || ing.note || '未知食材'
  const unitName = ing.unit?.name || ''
  
  return {
    id: ing.referenceId || ing.id || '',
    name: fromBackendIngredient(foodName),
    amount: ing.quantity || 0,
    unit: fromBackendUnit(unitName),
    category: inferCategory(foodName),
  }
}

/**
 * 前端食材项 -> 后端格式
 */
function toBackendIngredientItem(ing: Omit<Ingredient, 'id'>): MealieIngredient {
  return {
    quantity: ing.amount,
    unit: { name: toBackendUnit(ing.unit), description: '' },
    food: { name: toBackendIngredient(ing.name), description: '' },
    note: ing.name,
    display: `${ing.amount}${ing.unit} ${ing.name}`,
    title: null,
    original_text: `${ing.amount}${ing.unit}${ing.name}`,
  } as MealieIngredient
}

// ==================== 辅助函数 ====================

/**
 * 解析时间字符串（如 "30 minutes" -> 30）
 */
function parseTime(timeStr: string | null): number | null {
  if (!timeStr) return null
  const match = timeStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * 格式化时间为后端格式
 */
function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours} hours` : `${hours} hours ${mins} minutes`
}

/**
 * 解析份量
 */
function parseServings(yieldStr: string | null): number | null {
  if (!yieldStr) return null
  const match = yieldStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * 根据总时间推断难度
 */
function inferDifficulty(totalMinutes: number | null): 'easy' | 'medium' | 'hard' | null {
  if (!totalMinutes) return null
  if (totalMinutes <= 30) return 'easy'
  if (totalMinutes <= 90) return 'medium'
  return 'hard'
}

/**
 * 推断食材分类
 */
function inferCategory(foodName: string): string {
  const cnName = fromBackendIngredient(foodName).toLowerCase()
  
  // 根据食材名推断分类
  const categoryMap: Record<string, string[]> = {
    vegetables: ['白菜', '菠菜', '芹菜', '韭菜', '黄瓜', '西红柿', '茄子', '土豆', '胡萝卜', '洋葱', '青椒', '大蒜', '生姜', '葱', '香菜', '生菜', '西兰花', '花菜', '冬瓜', '南瓜', '丝瓜', '苦瓜', '豆角', '豌豆', '玉米'],
    meat: ['猪', '牛', '羊', '鸡', '鸭', '肉', '排骨', '培根', '火腿', '香肠'],
    seafood: ['鱼', '虾', '蟹', '贝', '鱿', '墨', '参', '海带', '紫菜'],
    eggs_dairy: ['蛋', '奶', '奶油', '黄油', '奶酪'],
    tofu: ['豆腐', '腐竹', '豆浆', '豆芽'],
    mushrooms: ['菇', '菌', '耳'],
    seasonings: ['盐', '糖', '酱油', '醋', '酒', '油', '酱', '粉', '精', '香料'],
    staples: ['米', '面', '粉', '馒头', '面包'],
    fruits: ['果', '瓜', '莓'],
    nuts: ['花', '核', '杏', '腰', '芝', '瓜'],
  }
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(k => cnName.includes(k))) {
      return category
    }
  }
  
  return 'other'
}

/**
 * 分类名转换（英文 -> 中文）
 */
function fromBackendCategory(name: string): string {
  const categoryMap: Record<string, string> = {
    'chinese': '中餐',
    'western': '西餐',
    'japanese': '日料',
    'korean': '韩餐',
    'dessert': '甜点',
    'drink': '饮品',
    'soup': '汤羹',
    'main': '主食',
    'snack': '小吃',
    'quick': '快手菜',
    'home': '家常菜',
    'party': '宴客菜',
    'rice': '下饭菜',
    'diet': '减脂餐',
    'vegetarian': '素食',
  }
  
  return categoryMap[name.toLowerCase()] || name
}
