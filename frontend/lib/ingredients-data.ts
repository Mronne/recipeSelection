export const INGREDIENT_CATEGORIES: Record<string, { name: string; color: string; items: string[] }> = {
  vegetables: { name: '蔬菜', color: '#4ADE80', items: ['白菜','菠菜','油菜','芹菜','韭菜','黄瓜','西红柿','茄子','土豆','胡萝卜','洋葱','青椒','辣椒','大蒜','生姜','葱','香菜','生菜','西兰花','花菜','冬瓜','南瓜','丝瓜','苦瓜','豆角','豌豆','玉米'] },
  meat: { name: '肉类', color: '#F87171', items: ['猪肉','五花肉','瘦肉','排骨','牛肉','牛腩','牛排','羊肉','鸡肉','鸡胸肉','鸡腿','鸡翅','鸭肉','培根','火腿','香肠','腊肉'] },
  seafood: { name: '海鲜', color: '#60A5FA', items: ['鱼','鲫鱼','草鱼','鲈鱼','虾','虾仁','螃蟹','蛤蜊','扇贝','鱿鱼','墨鱼','海参','海带','紫菜'] },
  eggs_dairy: { name: '蛋奶', color: '#FEF08A', items: ['鸡蛋','鸭蛋','鹌鹑蛋','牛奶','酸奶','奶油','黄油','奶酪'] },
  tofu: { name: '豆制品', color: '#D6D3D1', items: ['豆腐','嫩豆腐','老豆腐','豆腐干','豆腐皮','腐竹','豆浆','豆芽'] },
  mushrooms: { name: '菌菇', color: '#A8A29E', items: ['香菇','平菇','金针菇','杏鲍菇','木耳','银耳','蘑菇'] },
  seasonings: { name: '调料', color: '#FBBF24', items: ['盐','糖','白糖','冰糖','生抽','老抽','蚝油','醋','料酒','香油','花椒','八角','桂皮','香叶','辣椒','胡椒粉','淀粉','生粉','鸡精','味精','豆瓣酱','甜面酱','番茄酱'] },
  staples: { name: '主食', color: '#A78BFA', items: ['大米','糯米','面粉','面条','饺子皮','馄饨皮','粉丝','粉条','年糕','馒头','面包'] },
  fruits: { name: '水果', color: '#FB923C', items: ['苹果','梨','香蕉','橙子','柠檬','草莓','葡萄','西瓜','哈密瓜','桃子','李子','樱桃','枣','桂圆','荔枝'] },
  nuts: { name: '坚果', color: '#D4D4D8', items: ['花生','核桃','杏仁','腰果','芝麻','瓜子','松仁'] }
}
export const ALL_INGREDIENTS = Object.values(INGREDIENT_CATEGORIES).flatMap(c => c.items)
export const UNITS = ['克','千克','毫升','升','个','只','根','片','勺','汤匙','茶匙','杯','把','块','条','适量']
export const RECIPE_CATEGORIES = ['中餐','西餐','日料','韩餐','甜点','饮品','汤羹','主食','小吃','快手菜','家常菜','宴客菜','下饭菜','减脂餐','素食']
export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '简单', color: '#22C55E' },
  { value: 'medium', label: '中等', color: '#F59E0B' },
  { value: 'hard', label: '困难', color: '#EF4444' }
]
export const TIME_OPTIONS = [
  { value: 15, label: '15分钟' }, { value: 30, label: '30分钟' },
  { value: 45, label: '45分钟' }, { value: 60, label: '1小时' },
  { value: 90, label: '1.5小时' }, { value: 120, label: '2小时+' }
]
