from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.config import settings
from app.schemas.workout import IntensityBand, ProcessedProfile


@dataclass(frozen=True)
class ModelBundle:
    name: str
    model: Any
    features: list[str]
    metrics: dict[str, float]
    labels: list[str] | None = None
    label_mapping: dict[str, int] | None = None


def _load_artifact(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Model artifact not found: {path}")
    artifact = joblib.load(path)
    if isinstance(artifact, dict):
        return artifact
    return {"model": artifact}


def _bundle_from_artifact(path: Path, default_name: str) -> ModelBundle:
    artifact = _load_artifact(path)
    model = artifact.get("model", artifact)
    features = list(artifact.get("features") or getattr(model, "feature_names_in_", []) or [])
    metrics = dict(artifact.get("metrics") or {})
    labels = artifact.get("labels")
    label_mapping = artifact.get("label_mapping")
    return ModelBundle(
        name=default_name,
        model=model,
        features=features,
        metrics=metrics,
        labels=list(labels) if labels is not None else None,
        label_mapping=dict(label_mapping) if label_mapping is not None else None,
    )


@lru_cache
def load_calorie_bundle() -> ModelBundle:
    return _bundle_from_artifact(settings.MODEL_DIR / "best_calorie_regressor.joblib", "Random Forest Regressor")


@lru_cache
def load_intensity_bundle() -> ModelBundle:
    return _bundle_from_artifact(settings.MODEL_DIR / "best_intensity_classifier.joblib", "XGBoost Classifier")


def _experience_level(sessions_per_week: int) -> int:
    if sessions_per_week <= 2:
        return 1
    if sessions_per_week <= 4:
        return 2
    return 3


def _workout_type(goal: str, target_body_part: str) -> str:
    goal = (goal or "").strip().lower()
    target = (target_body_part or "").strip().lower()
    if goal in {"strength", "muscle gain"}:
        return "Strength"
    if goal == "fat loss":
        return "HIIT"
    if target in {"legs", "back", "chest", "arms", "shoulders", "core", "waist"}:
        return "Strength"
    return "Cardio"


def _gender_proxy(profile: ProcessedProfile) -> str:
    # The training data used a gender feature, but the current form does not ask for it.
    # Keep a stable placeholder so the pipeline can still run with unseen-category handling.
    return "unknown"


def _fat_percentage_proxy(profile: ProcessedProfile) -> float:
    bmi = profile.bmi
    if bmi < 18.5:
        base = 16.0
    elif bmi < 25:
        base = 20.0
    elif bmi < 30:
        base = 26.0
    else:
        base = 32.0
    age_adj = max(0.0, (profile.age - 25) * 0.12)
    goal_adj = -2.0 if profile.goal in {"strength", "muscle gain"} else 1.5
    return round(max(8.0, min(45.0, base + age_adj + goal_adj)), 1)


def _water_intake_proxy(profile: ProcessedProfile) -> float:
    intake = 1.8 + (profile.weight_kg / 35.0)
    if profile.goal == "fat loss":
        intake += 0.2
    return round(min(4.5, max(1.5, intake)), 1)


def _resting_bpm_proxy(profile: ProcessedProfile) -> int:
    return int(profile.resting_heart_rate)


def _max_bpm_proxy(profile: ProcessedProfile) -> int:
    estimate = 220 - profile.age
    if profile.stress_level >= 8:
        estimate -= 5
    return int(max(120, min(210, estimate)))


def _avg_bpm_proxy(profile: ProcessedProfile, intensity_band: str) -> int:
    max_bpm = _max_bpm_proxy(profile)
    resting = _resting_bpm_proxy(profile)
    ratio = {
        "Low": 0.62,
        "Medium": 0.74,
        "High": 0.84,
    }.get(intensity_band, 0.72)
    estimate = resting + (max_bpm - resting) * ratio
    return int(round(max(resting + 5, min(max_bpm - 3, estimate))))


def _bpm_response_ratio(avg_bpm: int, max_bpm: int) -> float:
    if max_bpm <= 0:
        return 0.0
    return round(avg_bpm / max_bpm, 3)


def _estimated_intensity_band(profile: ProcessedProfile) -> str:
    if profile.sleep_hours < 6 or profile.stress_level >= 8 or profile.resting_heart_rate > 90:
        return "Low"
    if profile.sleep_hours >= 7 and profile.stress_level <= 4 and profile.resting_heart_rate <= 78:
        return "High"
    return "Medium"


def _base_row(profile: ProcessedProfile) -> dict[str, Any]:
    intensity_band = _estimated_intensity_band(profile)
    max_bpm = _max_bpm_proxy(profile)
    avg_bpm = _avg_bpm_proxy(profile, intensity_band)
    return {
        "age": profile.age,
        "gender": _gender_proxy(profile),
        "weight_kg": profile.weight_kg,
        "height_m": round(profile.height_cm / 100.0, 2),
        "max_bpm": max_bpm,
        "avg_bpm": avg_bpm,
        "resting_bpm": _resting_bpm_proxy(profile),
        "workout_type": _workout_type(profile.goal, profile.target_body_part),
        "fat_percentage": _fat_percentage_proxy(profile),
        "water_intake_liters": _water_intake_proxy(profile),
        "workout_frequency_days_week": profile.sessions_per_week,
        "experience_level": _experience_level(profile.sessions_per_week),
        "bmi": profile.bmi,
        "bpm_response_ratio": _bpm_response_ratio(avg_bpm, max_bpm),
        "intensity_band": intensity_band,
    }


def build_regression_features(profile: ProcessedProfile, intensity_band: str | None = None) -> pd.DataFrame:
    row = _base_row(profile)
    if intensity_band:
        row["intensity_band"] = intensity_band
        row["avg_bpm"] = _avg_bpm_proxy(profile, intensity_band)
        row["bpm_response_ratio"] = _bpm_response_ratio(row["avg_bpm"], row["max_bpm"])
    bundle = load_calorie_bundle()
    if bundle.features:
        row = {feature: row.get(feature) for feature in bundle.features}
    return pd.DataFrame([row])


def build_classifier_features(profile: ProcessedProfile) -> pd.DataFrame:
    row = _base_row(profile)
    bundle = load_intensity_bundle()
    if bundle.features:
        row = {feature: row.get(feature) for feature in bundle.features}
    return pd.DataFrame([row])


def predict_intensity(profile: ProcessedProfile) -> tuple[IntensityBand, dict[str, float], ModelBundle]:
    bundle = load_intensity_bundle()
    features = build_classifier_features(profile)
    model = bundle.model

    if hasattr(model, "predict_proba"):
        raw_probabilities = model.predict_proba(features)[0]
    else:
        raw_probabilities = None

    if hasattr(model, "predict"):
        prediction = model.predict(features)[0]
    else:
        prediction = 1

    if bundle.labels and isinstance(prediction, (int, float)):
        predicted_class = bundle.labels[int(prediction)]
    elif isinstance(prediction, str):
        predicted_class = prediction
    else:
        predicted_class = "Medium"

    probabilities: dict[str, float]
    if raw_probabilities is not None and bundle.labels:
        probabilities = {label: float(prob) for label, prob in zip(bundle.labels, raw_probabilities, strict=False)}
    else:
        probabilities = {"Low": 0.2, "Medium": 0.6, "High": 0.2}

    total = sum(probabilities.values()) or 1.0
    probabilities = {key: round(value / total, 4) for key, value in probabilities.items()}
    if predicted_class not in probabilities:
        probabilities[predicted_class] = max(probabilities.values(), default=0.0)

    return predicted_class, probabilities, bundle


def predict_calories(profile: ProcessedProfile, intensity_band: str | None = None) -> tuple[float, ModelBundle]:
    bundle = load_calorie_bundle()
    features = build_regression_features(profile, intensity_band=intensity_band)
    model = bundle.model
    prediction = model.predict(features)
    calorie_value = float(prediction[0]) if len(prediction) else 0.0
    return calorie_value, bundle
