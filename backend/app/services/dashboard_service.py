from app.core.config import settings
from app.schemas.common import ChartData
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.data_service import (
    count_column_values,
    count_csv_rows,
    count_list_field_values,
    sum_numeric_columns,
)


def _chart_from_counts(counts: dict[str, int], fallback: dict[str, int]) -> ChartData:
    data = counts or fallback
    return ChartData(
        labels=list(data.keys()),
        values=[float(value) for value in data.values()],
    )


def get_summary() -> DashboardSummaryResponse:
    exercise_count = count_csv_rows("exercisedb_all_raw_flat.csv")
    gym_count = count_csv_rows("gym_members_exercise_tracking.csv")
    sleep_count = count_csv_rows("Sleep_health_and_lifestyle_dataset.csv")
    nutrition_count = count_csv_rows("daily_food_nutrition_dataset.csv")

    workout_counts = count_column_values("gym_members_exercise_tracking.csv", "Workout_Type")
    body_part_counts = count_list_field_values("exercisedb_all_raw_flat.csv", "bodyParts")
    equipment_counts = count_list_field_values("exercisedb_all_raw_flat.csv", "equipments")
    macro_totals = sum_numeric_columns(
        "daily_food_nutrition_dataset.csv",
        ["Protein (g)", "Carbohydrates (g)", "Fat (g)"],
    )

    return DashboardSummaryResponse(
        mock_mode=settings.MOCK_MODE,
        kpis={
            "exercise_count": exercise_count,
            "gym_rows": gym_count,
            "sleep_rows": sleep_count,
            "nutrition_rows": nutrition_count,
            "raw_dataset_count": 4,
        },
        workout_type_distribution=_chart_from_counts(
            workout_counts,
            {"Strength": 340, "Cardio": 210, "HIIT": 180, "Yoga": 120},
        ),
        body_part_coverage=_chart_from_counts(
            body_part_counts,
            {"chest": 180, "back": 210, "upper legs": 240, "upper arms": 160, "shoulders": 130, "waist": 150},
        ),
        equipment_coverage=_chart_from_counts(
            equipment_counts,
            {"body weight": 220, "dumbbell": 180, "barbell": 140, "cable": 120, "machine": 160},
        ),
        nutrition_macro_summary=ChartData(
            labels=["protein", "carbohydrates", "fat"],
            values=[
                round(macro_totals.get("Protein (g)", 0), 2),
                round(macro_totals.get("Carbohydrates (g)", 0), 2),
                round(macro_totals.get("Fat (g)", 0), 2),
            ],
        ),
    )
