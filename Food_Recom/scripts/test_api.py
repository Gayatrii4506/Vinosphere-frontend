import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from api.main import app

def test_api_endpoints():
    with TestClient(app) as client:
        print("\n--- Testing POST /recommend (Food -> Wine) ---")
        res1 = client.post("/recommend", json={"food_name": "Butter Chicken"})
        print("Status:", res1.status_code)
        print("Response:", res1.json())
        assert res1.status_code == 200
        assert "recommendations" in res1.json()

        print("\n--- Testing POST /recommend-food (Wine -> Food) ---")
        res2 = client.post("/recommend-food", json={"wine_name": "Sula Riesling"})
        print("Status:", res2.status_code)
        print("Response:", res2.json())
        assert res2.status_code == 200
        assert "recommendations" in res2.json()

        print("\n✅ API Endpoints Test Passed Successfully!")

if __name__ == "__main__":
    test_api_endpoints()
