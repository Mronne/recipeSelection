import { Recipe } from '@/types'
export const sampleRecipes: Recipe[] = [
  {
    id: '1', slug: 'hong-shao-rou', name: '红烧肉', description: '肥而不腻，入口即化的经典家常菜',
    coverImage: '/images/recipe-1.jpg', prepTime: 20, cookTime: 60, servings: 4, difficulty: 'medium',
    ingredients: [
      { id: '1', name: '五花肉', amount: 500, unit: '克', category: 'meat' },
      { id: '2', name: '葱', amount: 2, unit: '根', category: 'vegetables' },
      { id: '3', name: '生姜', amount: 3, unit: '片', category: 'vegetables' },
      { id: '4', name: '冰糖', amount: 30, unit: '克', category: 'seasonings' },
      { id: '5', name: '生抽', amount: 2, unit: '汤匙', category: 'seasonings' },
      { id: '6', name: '老抽', amount: 1, unit: '汤匙', category: 'seasonings' },
      { id: '7', name: '料酒', amount: 2, unit: '汤匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '五花肉洗净切成3厘米见方的块' },
      { id: '2', order: 2, description: '冷水下锅焯水，撇去浮沫后捞出沥干' },
      { id: '3', order: 3, description: '锅中放少许油，下入冰糖小火炒至焦糖色' },
      { id: '4', order: 4, description: '放入肉块翻炒上色' },
      { id: '5', order: 5, description: '加入葱姜、料酒、生抽、老抽翻炒均匀' },
      { id: '6', order: 6, description: '加入开水没过肉块，大火烧开后转小火炖煮1小时' },
      { id: '7', order: 7, description: '大火收汁，出锅前撒上葱花即可' },
    ],
    tags: ['中餐','家常菜','下饭菜'], category: '中餐', createdAt: '2024-01-15', updatedAt: '2024-01-15'
  },
  {
    id: '2', slug: 'fan-qie-chao-dan', name: '番茄炒蛋', description: '酸甜可口，老少皆宜的经典快手菜',
    coverImage: '/images/recipe-2.jpg', prepTime: 10, cookTime: 10, servings: 2, difficulty: 'easy',
    ingredients: [
      { id: '1', name: '鸡蛋', amount: 3, unit: '个', category: 'eggs_dairy' },
      { id: '2', name: '西红柿', amount: 2, unit: '个', category: 'vegetables' },
      { id: '3', name: '葱', amount: 1, unit: '根', category: 'vegetables' },
      { id: '4', name: '盐', amount: 1, unit: '茶匙', category: 'seasonings' },
      { id: '5', name: '糖', amount: 1, unit: '茶匙', category: 'seasonings' },
      { id: '6', name: '生抽', amount: 1, unit: '茶匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '鸡蛋打散，加入少许盐搅匀' },
      { id: '2', order: 2, description: '西红柿切块，葱切葱花' },
      { id: '3', order: 3, description: '热锅凉油，倒入蛋液炒熟盛出' },
      { id: '4', order: 4, description: '锅中留底油，放入西红柿翻炒出汁' },
      { id: '5', order: 5, description: '加入炒好的鸡蛋，调入盐、糖、生抽' },
      { id: '6', order: 6, description: '翻炒均匀，撒上葱花出锅' },
    ],
    tags: ['中餐','快手菜','家常菜','素食'], category: '中餐', createdAt: '2024-01-16', updatedAt: '2024-01-16'
  },
  {
    id: '3', slug: 'gou-qi-hong-zao-ji-tang', name: '枸杞红枣鸡汤', description: '滋补养生的营养汤品',
    coverImage: '/images/recipe-3.jpg', prepTime: 15, cookTime: 90, servings: 4, difficulty: 'easy',
    ingredients: [
      { id: '1', name: '鸡肉', amount: 500, unit: '克', category: 'meat' },
      { id: '2', name: '红枣', amount: 10, unit: '颗', category: 'fruits' },
      { id: '3', name: '枸杞', amount: 15, unit: '克', category: 'fruits' },
      { id: '4', name: '生姜', amount: 3, unit: '片', category: 'vegetables' },
      { id: '5', name: '盐', amount: 1, unit: '茶匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '鸡肉洗净切块，冷水下锅焯水' },
      { id: '2', order: 2, description: '捞出洗净血沫' },
      { id: '3', order: 3, description: '将鸡肉、红枣、姜片放入砂锅' },
      { id: '4', order: 4, description: '加入足量清水，大火烧开后转小火炖煮1.5小时' },
      { id: '5', order: 5, description: '出锅前10分钟加入枸杞' },
      { id: '6', order: 6, description: '调入盐即可享用' },
    ],
    tags: ['中餐','汤羹','养生'], category: '汤羹', createdAt: '2024-01-17', updatedAt: '2024-01-17'
  },
  {
    id: '4', slug: 'xiao-long-bao', name: '小笼包', description: '皮薄馅大，汤汁鲜美的传统点心',
    coverImage: '/images/recipe-4.jpg', prepTime: 45, cookTime: 15, servings: 4, difficulty: 'hard',
    ingredients: [
      { id: '1', name: '面粉', amount: 300, unit: '克', category: 'staples' },
      { id: '2', name: '猪肉', amount: 300, unit: '克', category: 'meat' },
      { id: '3', name: '生姜', amount: 1, unit: '块', category: 'vegetables' },
      { id: '4', name: '葱', amount: 2, unit: '根', category: 'vegetables' },
      { id: '5', name: '生抽', amount: 2, unit: '汤匙', category: 'seasonings' },
      { id: '6', name: '料酒', amount: 1, unit: '汤匙', category: 'seasonings' },
      { id: '7', name: '香油', amount: 1, unit: '汤匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '面粉加水和成光滑面团，醒发30分钟' },
      { id: '2', order: 2, description: '猪肉剁碎，加入调料搅拌上劲' },
      { id: '3', order: 3, description: '面团分成小剂子，擀成薄皮' },
      { id: '4', order: 4, description: '包入肉馅，捏出褶皱' },
      { id: '5', order: 5, description: '水开后上锅蒸10-12分钟' },
    ],
    tags: ['中餐','小吃','主食'], category: '小吃', createdAt: '2024-01-18', updatedAt: '2024-01-18'
  },
  {
    id: '5', slug: 'gong-bao-ji-ding', name: '宫保鸡丁', description: '麻辣鲜香，花生酥脆的经典川菜',
    coverImage: '/images/recipe-5.jpg', prepTime: 20, cookTime: 15, servings: 3, difficulty: 'medium',
    ingredients: [
      { id: '1', name: '鸡胸肉', amount: 300, unit: '克', category: 'meat' },
      { id: '2', name: '花生', amount: 50, unit: '克', category: 'nuts' },
      { id: '3', name: '干辣椒', amount: 10, unit: '个', category: 'seasonings' },
      { id: '4', name: '葱', amount: 2, unit: '根', category: 'vegetables' },
      { id: '5', name: '生抽', amount: 2, unit: '汤匙', category: 'seasonings' },
      { id: '6', name: '醋', amount: 1, unit: '汤匙', category: 'seasonings' },
      { id: '7', name: '糖', amount: 1, unit: '汤匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '鸡肉切丁，用料酒、生抽、淀粉腌制15分钟' },
      { id: '2', order: 2, description: '调好宫保汁：生抽、醋、糖、淀粉、水' },
      { id: '3', order: 3, description: '热锅凉油，下入鸡丁滑散至变色盛出' },
      { id: '4', order: 4, description: '锅中留底油，爆香干辣椒和花椒' },
      { id: '5', order: 5, description: '放入鸡丁、葱段翻炒' },
      { id: '6', order: 6, description: '倒入宫保汁，快速翻炒均匀' },
      { id: '7', order: 7, description: '最后加入炸好的花生，炒匀出锅' },
    ],
    tags: ['中餐','川菜','下饭菜'], category: '中餐', createdAt: '2024-01-19', updatedAt: '2024-01-19'
  },
  {
    id: '6', slug: 'suan-rong-xi-lan-hua', name: '蒜蓉西兰花', description: '清爽健康的快手素菜',
    coverImage: '/images/recipe-6.jpg', prepTime: 10, cookTime: 5, servings: 2, difficulty: 'easy',
    ingredients: [
      { id: '1', name: '西兰花', amount: 300, unit: '克', category: 'vegetables' },
      { id: '2', name: '大蒜', amount: 4, unit: '瓣', category: 'vegetables' },
      { id: '3', name: '盐', amount: 1, unit: '茶匙', category: 'seasonings' },
      { id: '4', name: '生抽', amount: 1, unit: '茶匙', category: 'seasonings' },
      { id: '5', name: '香油', amount: 1, unit: '茶匙', category: 'seasonings' },
    ],
    steps: [
      { id: '1', order: 1, description: '西兰花掰成小朵，洗净' },
      { id: '2', order: 2, description: '烧一锅水，加少许盐和油，焯烫西兰花1分钟' },
      { id: '3', order: 3, description: '捞出过凉水，沥干水分' },
      { id: '4', order: 4, description: '大蒜剁成蒜蓉' },
      { id: '5', order: 5, description: '热锅凉油，爆香蒜蓉' },
      { id: '6', order: 6, description: '放入西兰花快速翻炒' },
      { id: '7', order: 7, description: '调入盐、生抽、香油，炒匀出锅' },
    ],
    tags: ['中餐','快手菜','素食','减脂餐'], category: '中餐', createdAt: '2024-01-20', updatedAt: '2024-01-20'
  }
]
