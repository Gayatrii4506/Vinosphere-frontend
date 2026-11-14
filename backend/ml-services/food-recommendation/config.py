from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    MODEL_NAME = "gemini-3.5-flash-lite"

    TEMPERATURE = 0.2

    MAX_RETRIES = 3

    OUTPUT_FILE = "data/processed/food_profiles.json"