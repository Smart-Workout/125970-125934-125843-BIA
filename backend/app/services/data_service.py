import csv
import ast
from collections import Counter
from pathlib import Path
from typing import Any

from app.core.config import settings


def raw_data_path(filename: str) -> Path:
    return settings.RAW_DATA_DIR / filename


def processed_data_path(filename: str) -> Path:
    return settings.PROCESSED_DATA_DIR / filename


def file_exists(filename: str) -> bool:
    return raw_data_path(filename).exists()


def count_csv_rows(filename: str) -> int:
    path = raw_data_path(filename)
    if not path.exists():
        return 0
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        next(reader, None)
        return sum(1 for _ in reader)


def count_column_values(filename: str, column: str, limit: int = 8) -> dict[str, int]:
    path = raw_data_path(filename)
    if not path.exists():
        return {}
    counter: Counter[str] = Counter()
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            value = (row.get(column) or "").strip()
            if value:
                counter[value] += 1
    return dict(counter.most_common(limit))


def read_csv_rows(filename: str, limit: int | None = None) -> list[dict[str, str]]:
    path = raw_data_path(filename)
    if not path.exists():
        return []
    rows: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(row)
            if limit is not None and len(rows) >= limit:
                break
    return rows


def read_processed_csv_rows(filename: str, limit: int | None = None) -> list[dict[str, str]]:
    path = processed_data_path(filename)
    if not path.exists():
        return []
    rows: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(row)
            if limit is not None and len(rows) >= limit:
                break
    return rows


def parse_list_field(value: str | None) -> list[str]:
    if not value:
        return []
    try:
        parsed: Any = ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return [value.strip().lower()] if value.strip() else []
    if isinstance(parsed, list):
        return [str(item).strip().lower() for item in parsed if str(item).strip()]
    return [str(parsed).strip().lower()] if str(parsed).strip() else []


def count_list_field_values(filename: str, column: str, limit: int = 8) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for row in read_csv_rows(filename):
        for item in parse_list_field(row.get(column)):
            counter[item] += 1
    return dict(counter.most_common(limit))


def sum_numeric_columns(filename: str, columns: list[str]) -> dict[str, float]:
    totals = {column: 0.0 for column in columns}
    for row in read_csv_rows(filename):
        for column in columns:
            try:
                totals[column] += float(row.get(column) or 0)
            except ValueError:
                continue
    return totals


def readiness_checks() -> dict[str, bool]:
    return {
        "raw_data_dir_exists": settings.RAW_DATA_DIR.exists(),
        "exercise_dataset_exists": file_exists("exercisedb_all_raw_flat.csv"),
        "gym_dataset_exists": file_exists("gym_members_exercise_tracking.csv"),
        "sleep_dataset_exists": file_exists("Sleep_health_and_lifestyle_dataset.csv"),
        "nutrition_dataset_exists": file_exists("daily_food_nutrition_dataset.csv"),
        "model_dir_exists": settings.MODEL_DIR.exists(),
        "calorie_model_exists": (settings.MODEL_DIR / "best_calorie_regressor.joblib").exists(),
        "intensity_model_exists": (settings.MODEL_DIR / "best_intensity_classifier.joblib").exists(),
        "chroma_db_dir_exists": settings.CHROMA_DB_DIR.exists(),
    }
