from pydantic import BaseModel, Field


class ParsedIngredient(BaseModel):
    name: str = Field(..., description="食材名称，如'猪肉'、'生抽'")
    amount: float = Field(default=0, description="数量，如 500、2、0.5。如果无法确定则填 0")
    unit: str = Field(default="适量", description="单位，如克、千克、个、勺、茶匙、汤匙、杯、毫升、升、瓣、片、根、条、块、适量、少许")


class ParsedStep(BaseModel):
    order: int = Field(..., description="步骤序号，从1开始")
    description: str = Field(..., description="步骤描述，要求简单明了，一句话说明核心操作，不要包含序号前缀")


class ParsedRecipeText(BaseModel):
    name: str = Field(default="", description="菜名")
    description: str = Field(default="", description="简短描述，一两句话概括这道菜的特点")
    prep_time: int = Field(default=15, description="准备时间，单位分钟。如果无法确定则默认15")
    cook_time: int = Field(default=30, description="烹饪时间，单位分钟。如果无法确定则默认30")
    servings: int = Field(default=2, description="份量，几人份。如果无法确定则默认2")
    ingredients: list[ParsedIngredient] = Field(default_factory=list, description="食材列表")
    steps: list[ParsedStep] = Field(default_factory=list, description="烹饪步骤列表")
