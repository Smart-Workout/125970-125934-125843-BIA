from app.core.config import settings
from app.schemas.common import ChartData
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    LifestyleProfileCard,
    LifestyleProfilesSection,
    LifestyleScatterPoint,
    RelationalLocationRow,
    RelationalMembershipSection,
)
from app.services.data_service import (
    count_column_values,
    count_csv_rows,
    count_list_field_values,
    read_processed_csv_rows,
    sum_numeric_columns,
)


def _chart_from_counts(counts: dict[str, int], fallback: dict[str, int]) -> ChartData:
    data = counts or fallback
    return ChartData(labels=list(data.keys()), values=[float(value) for value in data.values()])


def _to_float(value: str | None, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except (TypeError, ValueError):
        return default


def _to_int(value: str | None, default: int = 0) -> int:
    try:
        return int(float(value or default))
    except (TypeError, ValueError):
        return default


def _build_relational_membership_section() -> RelationalMembershipSection:
    monthly_rows = read_processed_csv_rows("gymdb_mart_monthly_activity.csv")
    location_rows = read_processed_csv_rows("gymdb_mart_location_utilization.csv")
    subscription_rows = read_processed_csv_rows("gymdb_mart_subscription_summary.csv")
    workout_rows = read_processed_csv_rows("gymdb_mart_session_by_workout.csv")
    gym_type_rows = read_processed_csv_rows("gymdb_mart_gym_type_workout_summary.csv")
    user_rows = read_processed_csv_rows("gymdb_dim_users_cleaned.csv")

    active_members = len(user_rows)
    total_sessions = sum(_to_int(row.get("session_count")) for row in monthly_rows)
    avg_checkins_per_member = round(total_sessions / active_members, 1) if active_members else 0.0

    gym_type_totals: dict[str, float] = {}
    for row in gym_type_rows:
        gym_type = row.get("gym_type") or "Unknown"
        gym_type_totals[gym_type] = gym_type_totals.get(gym_type, 0.0) + _to_float(row.get("session_count"))

    return RelationalMembershipSection(
        kpis={
            "active_members": active_members,
            "avg_checkins_per_member": avg_checkins_per_member,
            "subscription_plans": len(subscription_rows),
            "gym_locations": len(location_rows),
        },
        monthly_activity=ChartData(
            labels=[row.get("session_month", "") for row in monthly_rows],
            values=[_to_float(row.get("session_count")) for row in monthly_rows],
        ),
        subscription_mix=ChartData(
            labels=[row.get("subscription_plan", "") for row in subscription_rows],
            values=[_to_float(row.get("user_count")) for row in subscription_rows],
        ),
        gym_type_session_mix=ChartData(
            labels=list(gym_type_totals.keys()),
            values=list(gym_type_totals.values()),
        ),
        workout_avg_calories=ChartData(
            labels=[row.get("workout_type", "") for row in workout_rows],
            values=[round(_to_float(row.get("avg_calories")), 2) for row in workout_rows],
        ),
        top_locations=[
            RelationalLocationRow(
                gym_id=row.get("gym_id", ""),
                location=row.get("location", ""),
                gym_type=row.get("gym_type", ""),
                session_count=_to_int(row.get("session_count")),
                unique_users=_to_int(row.get("unique_users")),
                avg_duration_minutes=round(_to_float(row.get("avg_duration_minutes")), 2),
            )
            for row in location_rows[:6]
        ],
    )


def _build_lifestyle_profiles_section() -> LifestyleProfilesSection:
    profile_rows = read_processed_csv_rows("sleep_cluster_profile.csv")
    scatter_rows = read_processed_csv_rows("sleep_cleaned_readiness_clusters.csv", limit=60)
    silhouette_rows = read_processed_csv_rows("sleep_kmeans_silhouette_scores.csv")

    sorted_profiles = sorted(profile_rows, key=lambda row: _to_int(row.get("archetype_cluster")))
    labels = [f"Cluster {row.get('archetype_cluster', '?')}" for row in sorted_profiles]

    return LifestyleProfilesSection(
        silhouette_scores=ChartData(
            labels=[f"k={row.get('k', '')}" for row in silhouette_rows],
            values=[round(_to_float(row.get("silhouette_score")), 4) for row in silhouette_rows],
        ),
        sleep_duration_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("sleep_duration")), 2) for row in sorted_profiles],
        ),
        activity_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("physical_activity_level")), 2) for row in sorted_profiles],
        ),
        stress_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("stress_level")), 2) for row in sorted_profiles],
        ),
        profile_cards=[
            LifestyleProfileCard(
                cluster_id=_to_int(row.get("archetype_cluster")),
                label=row.get("suggested_archetype_label", "Lifestyle archetype"),
                readiness_score=round(_to_float(row.get("readiness_score")), 2),
                sleep_duration=round(_to_float(row.get("sleep_duration")), 2),
                physical_activity_level=round(_to_float(row.get("physical_activity_level")), 2),
                stress_level=round(_to_float(row.get("stress_level")), 2),
                record_count=_to_int(row.get("record_count")),
            )
            for row in sorted_profiles
        ],
        scatter_points=[
            LifestyleScatterPoint(
                cluster_id=_to_int(row.get("archetype_cluster")),
                sleep_duration=round(_to_float(row.get("sleep_duration")), 2),
                physical_activity_level=round(_to_float(row.get("physical_activity_level")), 2),
                stress_level=round(_to_float(row.get("stress_level")), 2),
                readiness_score=round(_to_float(row.get("readiness_score")), 2),
            )
            for row in scatter_rows
        ],
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
        relational_membership=_build_relational_membership_section(),
        lifestyle_profiles=_build_lifestyle_profiles_section(),
    )
