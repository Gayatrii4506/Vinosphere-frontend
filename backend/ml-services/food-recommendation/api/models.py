from pydantic import BaseModel
from typing import Optional

class FoodRequest(BaseModel):
    food_name: str
    user_id: Optional[str] = None


class WineRequest(BaseModel):
    wine_name: str
    user_id: Optional[str] = None