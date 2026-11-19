from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib
from pathlib import Path




app = FastAPI(
    title="Titanic Survival Prediction API",
    description="Machine Learning API for Titanic passenger survival prediction",
    version="1.0"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://titanic-insights-frontend.onrender.com"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)




BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "titanic_model.pkl"

model = joblib.load(MODEL_PATH)




class Passenger(BaseModel):

    Pclass: int = Field(ge=1, le=3)
    Sex: str
    Age: float = Field(ge=0, le=100)
    SibSp: int = Field(ge=0)
    Parch: int = Field(ge=0)
    Fare: float = Field(ge=0)
    Embarked: str




@app.get("/")
def home():

    return {
        "message": "Titanic Survival Prediction API is running!"
    }




@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True
    }



@app.post("/api/predict")
def predict_survival(passenger: Passenger):

    passenger_data = passenger.model_dump()

    passenger_data["FamilySize"] = (
        passenger_data["SibSp"] +
        passenger_data["Parch"] + 1
    )

    passenger_data["IsAlone"] = (
        1 if passenger_data["FamilySize"] == 1 else 0
    )

    input_data = pd.DataFrame([passenger_data])

    input_data = input_data[
        [
            "Pclass",
            "Sex",
            "Age",
            "SibSp",
            "Parch",
            "Fare",
            "Embarked",
            "FamilySize",
            "IsAlone"
        ]
    ]


    prediction = int(model.predict(input_data)[0])

    probabilities = model.predict_proba(input_data)[0]

    survival_probability = float(probabilities[1]) * 100

    return {
        "prediction": prediction,
        "result": (
            "Survived" if prediction == 1
            else "Did Not Survive"
        ),
        "survival_probability": round(survival_probability, 2),
        "death_probability": round(
            float(probabilities[0]) * 100, 2
        )
    }


@app.get("/api/analytics")
def passenger_analytics():

    DATA_PATH = BASE_DIR.parent / "dataset" / "train.csv"

    data = pd.read_csv(DATA_PATH)

    
    class_data = data.groupby(
        ["Pclass", "Survived"]
    ).size().unstack(fill_value=0)

    data["AgeGroup"] = pd.cut(
        data["Age"],
        bins=[0, 12, 19, 59, 120],
        labels=["Children", "Teenagers", "Adults", "Seniors"],
        include_lowest=True
    )

    age_data = data.groupby(
        ["AgeGroup", "Survived"],
        observed=False
    ).size().unstack(fill_value=0)

    return {
        "class_labels": [
            "First Class",
            "Second Class",
            "Third Class"
        ],

        "class_survived": [
            int(class_data.loc[i, 1]) for i in [1, 2, 3]
        ],

        "class_not_survived": [
            int(class_data.loc[i, 0]) for i in [1, 2, 3]
        ],

        "age_labels": [
            str(x) for x in age_data.index
        ],

        "age_survived": [
            int(x) for x in age_data[1]
        ],

        "age_not_survived": [
            int(x) for x in age_data[0]
        ]
    }