from collections import Counter
import json

from app.core.config import settings
from app.schemas.common import ChartData
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardFilterOptions,
    DashboardWorkspaceSection,
    EngagementScatterPoint,
    ExecutiveSummarySection,
    ExercisePlanDashboardSection,
    LifestyleProfileCard,
    LifestyleProfilesSection,
    LifestyleScatterPoint,
    ModelFeatureImpact,
    NutritionFoodItem,
    NutritionPlanSection,
    RelationalLocationRow,
    RelationalMembershipSection,
    SourceGraph,
    SourceGraphEdge,
    SourceGraphNode,
    SubscriptionPlanRow,
    SubscriptionTierDashboard,
    UsageHeatmapCell,
    UserInfoRow,
    UserInfoSection,
)
from app.services.data_service import (
    count_column_values,
    count_csv_rows,
    count_list_field_values,
    read_csv_rows,
    read_processed_csv_rows,
    sum_numeric_columns,
)


SUBSCRIPTION_TIER_RULES = {
    "basic": {
        "title": "Basic Users",
        "plans": {"Basic", "Student"},
        "note": "Basic dashboard groups Basic and Student subscriptions because both plans use limited/basic facility access.",
    },
    "advanced": {
        "title": "Advanced Users",
        "plans": {"Pro"},
        "note": "Advanced dashboard maps to the Pro subscription because it unlocks all facilities, unlimited classes, and trainer access.",
    },
}


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


def _tier_for_subscription(plan: str) -> str:
    for tier, config in SUBSCRIPTION_TIER_RULES.items():
        if plan in config["plans"]:
            return tier
    return "basic"


def _chart_from_counter(counter: Counter[str], limit: int | None = None) -> ChartData:
    rows = counter.most_common(limit)
    return ChartData(labels=[label for label, _ in rows], values=[float(value) for _, value in rows])


def _build_plan_breakdown(subscription_rows: list[dict[str, str]]) -> list[SubscriptionPlanRow]:
    return [
        SubscriptionPlanRow(
            subscription_plan=row.get("subscription_plan", ""),
            tier=_tier_for_subscription(row.get("subscription_plan", "")),
            user_count=_to_int(row.get("user_count")),
            price_per_month=round(_to_float(row.get("price_per_month")), 2),
            estimated_monthly_recurring_revenue=round(_to_float(row.get("estimated_monthly_recurring_revenue")), 2),
        )
        for row in subscription_rows
    ]


def _build_tier_dashboards(
    user_rows: list[dict[str, str]],
    subscription_rows: list[dict[str, str]],
) -> list[SubscriptionTierDashboard]:
    session_rows = read_processed_csv_rows("gymdb_fact_sessions_sample.csv")
    total_members = len(user_rows)
    total_sessions = len(session_rows)
    plan_revenue = {
        row.get("subscription_plan", ""): _to_float(row.get("estimated_monthly_recurring_revenue"))
        for row in subscription_rows
    }
    dashboards: list[SubscriptionTierDashboard] = []

    for tier, config in SUBSCRIPTION_TIER_RULES.items():
        included_plans = sorted(config["plans"])
        member_count = sum(1 for row in user_rows if row.get("subscription_plan") in config["plans"])
        tier_sessions = [row for row in session_rows if row.get("subscription_plan") in config["plans"]]
        session_count = len(tier_sessions)
        monthly_counts: Counter[str] = Counter()
        workout_counts: Counter[str] = Counter()
        location_metrics: dict[tuple[str, str, str], dict[str, object]] = {}
        duration_total = 0.0
        calorie_total = 0.0

        for row in tier_sessions:
            month = row.get("session_month") or "Unknown"
            workout = row.get("workout_type") or "Unknown"
            monthly_counts[month] += 1
            workout_counts[workout] += 1
            duration_total += _to_float(row.get("duration_minutes"))
            calorie_total += _to_float(row.get("calories_burned"))

            key = (
                row.get("gym_id") or "unknown",
                row.get("location") or "Unknown",
                row.get("gym_type") or "Unknown",
            )
            metric = location_metrics.setdefault(
                key,
                {"session_count": 0, "unique_users": set(), "duration_total": 0.0},
            )
            metric["session_count"] = int(metric["session_count"]) + 1
            users = metric["unique_users"]
            if isinstance(users, set):
                users.add(row.get("user_id") or "unknown")
            metric["duration_total"] = float(metric["duration_total"]) + _to_float(row.get("duration_minutes"))

        top_locations = []
        for (gym_id, location, gym_type), metric in sorted(
            location_metrics.items(),
            key=lambda item: int(item[1]["session_count"]),
            reverse=True,
        )[:5]:
            sessions = int(metric["session_count"])
            users = metric["unique_users"]
            top_locations.append(
                RelationalLocationRow(
                    gym_id=gym_id,
                    location=location,
                    gym_type=gym_type,
                    session_count=sessions,
                    unique_users=len(users) if isinstance(users, set) else 0,
                    avg_duration_minutes=round(float(metric["duration_total"]) / sessions, 2) if sessions else 0.0,
                )
            )

        top_workout_type = workout_counts.most_common(1)[0][0] if workout_counts else "No sessions"
        monthly_activity = ChartData(
            labels=sorted(monthly_counts.keys()),
            values=[float(monthly_counts[label]) for label in sorted(monthly_counts.keys())],
        )

        dashboards.append(
            SubscriptionTierDashboard(
                tier=tier,
                title=str(config["title"]),
                included_subscriptions=included_plans,
                member_count=member_count,
                member_share=round((member_count / total_members) * 100, 1) if total_members else 0.0,
                sampled_sessions=session_count,
                session_share=round((session_count / total_sessions) * 100, 1) if total_sessions else 0.0,
                estimated_monthly_recurring_revenue=round(sum(plan_revenue.get(plan, 0.0) for plan in included_plans), 2),
                avg_checkins_per_member=round(session_count / member_count, 1) if member_count else 0.0,
                avg_duration_minutes=round(duration_total / session_count, 2) if session_count else 0.0,
                avg_calories_per_session=round(calorie_total / session_count, 2) if session_count else 0.0,
                top_workout_type=top_workout_type,
                membership_note=str(config["note"]),
                monthly_activity=monthly_activity,
                workout_mix=_chart_from_counter(workout_counts, limit=6),
                top_locations=top_locations,
            )
        )

    return dashboards


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
        plan_breakdown=_build_plan_breakdown(subscription_rows),
        tier_dashboards=_build_tier_dashboards(user_rows, subscription_rows),
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
        quality_of_sleep_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("quality_of_sleep")), 2) for row in sorted_profiles],
        ),
        activity_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("physical_activity_level")), 2) for row in sorted_profiles],
        ),
        stress_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("stress_level")), 2) for row in sorted_profiles],
        ),
        daily_steps_by_cluster=ChartData(
            labels=labels,
            values=[round(_to_float(row.get("daily_steps")), 2) for row in sorted_profiles],
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


def _filter_session_rows(
    rows: list[dict[str, str]],
    start_month: str | None = None,
    end_month: str | None = None,
    selected_months: set[str] | None = None,
    locations: set[str] | None = None,
    gender: str | None = None,
) -> list[dict[str, str]]:
    filtered = []
    for row in rows:
        month = row.get("session_month") or ""
        if selected_months and month not in selected_months:
            continue
        if start_month and month < start_month:
            continue
        if end_month and month > end_month:
            continue
        if locations and row.get("location") not in locations:
            continue
        if gender and row.get("gender") != gender:
            continue
        filtered.append(row)
    return filtered


def _chart_from_sorted_counter(counter: Counter[str]) -> ChartData:
    labels = sorted(counter.keys())
    return ChartData(labels=labels, values=[float(counter[label]) for label in labels])


def _average(values: list[float]) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


def _parse_locations(value: str | None) -> set[str] | None:
    if not value:
        return None
    locations = {item.strip() for item in value.split(",") if item.strip()}
    return locations or None


def _parse_months(value: str | None) -> set[str] | None:
    if not value:
        return None
    months = {item.strip() for item in value.split(",") if item.strip()}
    return months or None


def _build_filter_options(session_rows: list[dict[str, str]]) -> DashboardFilterOptions:
    return DashboardFilterOptions(
        months=sorted({row.get("session_month", "") for row in session_rows if row.get("session_month")}),
        locations=sorted({row.get("location", "") for row in session_rows if row.get("location")}),
        genders=sorted({row.get("gender", "") for row in session_rows if row.get("gender")}),
    )


def _build_executive_summary(filtered_rows: list[dict[str, str]]) -> ExecutiveSummarySection:
    unique_users = {row.get("user_id") for row in filtered_rows if row.get("user_id")}
    durations = [_to_float(row.get("duration_minutes")) for row in filtered_rows]
    calories = [_to_float(row.get("calories_burned")) for row in filtered_rows]
    heatmap_counts: Counter[tuple[str, int]] = Counter()
    user_points: dict[str, dict[str, object]] = {}

    for row in filtered_rows:
        weekday = row.get("session_weekday") or "Unknown"
        hour = _to_int(row.get("session_hour"))
        heatmap_counts[(weekday, hour)] += 1

        user_id = row.get("user_id") or "unknown"
        point = user_points.setdefault(
            user_id,
            {
                "workout_type": row.get("workout_type") or "Unknown",
                "gender": row.get("gender") or "Unknown",
                "duration_total": 0.0,
                "calorie_total": 0.0,
                "session_count": 0,
            },
        )
        point["duration_total"] = float(point["duration_total"]) + _to_float(row.get("duration_minutes"))
        point["calorie_total"] = float(point["calorie_total"]) + _to_float(row.get("calories_burned"))
        point["session_count"] = int(point["session_count"]) + 1

    return ExecutiveSummarySection(
        kpis={
            "selected_sessions": len(filtered_rows),
            "selected_users": len(unique_users),
            "avg_duration_minutes": _average(durations),
            "avg_calories": _average(calories),
        },
        monthly_activity=_chart_from_sorted_counter(Counter(row.get("session_month") or "Unknown" for row in filtered_rows)),
        gender_mix=_chart_from_counter(Counter(row.get("gender") or "Unknown" for row in filtered_rows)),
        location_mix=_chart_from_counter(Counter(row.get("location") or "Unknown" for row in filtered_rows), limit=8),
        workout_mix=_chart_from_counter(Counter(row.get("workout_type") or "Unknown" for row in filtered_rows), limit=8),
        usage_heatmap=[
            UsageHeatmapCell(weekday=weekday, hour=hour, session_count=count)
            for (weekday, hour), count in sorted(heatmap_counts.items())
        ],
        engagement_scatter=[
            EngagementScatterPoint(
                user_id=user_id,
                workout_type=str(point["workout_type"]),
                gender=str(point["gender"]),
                duration_minutes=round(float(point["duration_total"]) / int(point["session_count"]), 2),
                calories_burned=round(float(point["calorie_total"]) / int(point["session_count"]), 2),
                session_count=int(point["session_count"]),
            )
            for user_id, point in sorted(user_points.items(), key=lambda item: int(item[1]["session_count"]), reverse=True)[:90]
        ],
    )


def _build_user_info(filtered_rows: list[dict[str, str]]) -> UserInfoSection:
    user_metrics: dict[str, dict[str, object]] = {}
    for row in filtered_rows:
        user_id = row.get("user_id") or "unknown"
        metric = user_metrics.setdefault(
            user_id,
            {
                "age": _to_int(row.get("age")),
                "gender": row.get("gender") or "Unknown",
                "user_location": row.get("user_location") or "Unknown",
                "subscription_plan": row.get("subscription_plan") or "Unknown",
                "age_group": row.get("age_group") or "Unknown",
                "session_count": 0,
                "duration_total": 0.0,
                "calorie_total": 0.0,
            },
        )
        metric["session_count"] = int(metric["session_count"]) + 1
        metric["duration_total"] = float(metric["duration_total"]) + _to_float(row.get("duration_minutes"))
        metric["calorie_total"] = float(metric["calorie_total"]) + _to_float(row.get("calories_burned"))

    metrics = list(user_metrics.items())
    sample_users = []
    for user_id, metric in sorted(metrics, key=lambda item: int(item[1]["session_count"]), reverse=True)[:8]:
        session_count = int(metric["session_count"])
        sample_users.append(
            UserInfoRow(
                user_id=user_id,
                age=int(metric["age"]),
                gender=str(metric["gender"]),
                user_location=str(metric["user_location"]),
                subscription_plan=str(metric["subscription_plan"]),
                age_group=str(metric["age_group"]),
                session_count=session_count,
                avg_duration_minutes=round(float(metric["duration_total"]) / session_count, 2) if session_count else 0.0,
                avg_calories=round(float(metric["calorie_total"]) / session_count, 2) if session_count else 0.0,
            )
        )

    return UserInfoSection(
        kpis={
            "unique_users": len(user_metrics),
            "avg_age": _average([float(metric["age"]) for _, metric in metrics]),
            "avg_sessions_per_user": round(len(filtered_rows) / len(user_metrics), 2) if user_metrics else 0.0,
            "subscription_types": len({str(metric["subscription_plan"]) for _, metric in metrics}),
        },
        gender_mix=_chart_from_counter(Counter(str(metric["gender"]) for _, metric in metrics)),
        age_group_mix=_chart_from_counter(Counter(str(metric["age_group"]) for _, metric in metrics)),
        subscription_mix=_chart_from_counter(Counter(str(metric["subscription_plan"]) for _, metric in metrics)),
        top_user_locations=_chart_from_counter(Counter(str(metric["user_location"]) for _, metric in metrics), limit=8),
        sample_users=sample_users,
    )


def _build_nutrition_plan() -> NutritionPlanSection:
    rows = read_csv_rows("daily_food_nutrition_dataset.csv")
    calorie_values = [_to_float(row.get("Calories (kcal)")) for row in rows]
    protein_values = [_to_float(row.get("Protein (g)")) for row in rows]
    carb_values = [_to_float(row.get("Carbohydrates (g)")) for row in rows]
    fat_values = [_to_float(row.get("Fat (g)")) for row in rows]
    water_values = [_to_float(row.get("Water_Intake (ml)")) for row in rows]

    meal_calories: dict[str, float] = {}
    meal_protein: dict[str, float] = {}
    for row in rows:
        meal = row.get("Meal_Type") or "Unknown"
        meal_calories[meal] = meal_calories.get(meal, 0.0) + _to_float(row.get("Calories (kcal)"))
        meal_protein[meal] = meal_protein.get(meal, 0.0) + _to_float(row.get("Protein (g)"))

    top_foods = sorted(rows, key=lambda row: _to_float(row.get("Protein (g)")), reverse=True)[:8]

    return NutritionPlanSection(
        kpis={
            "food_items": len(rows),
            "avg_calories": _average(calorie_values),
            "avg_protein_g": _average(protein_values),
            "avg_water_ml": _average(water_values),
        },
        macro_mix=ChartData(
            labels=["Protein", "Carbohydrates", "Fat"],
            values=[round(sum(protein_values), 2), round(sum(carb_values), 2), round(sum(fat_values), 2)],
        ),
        meal_calories=ChartData(labels=list(meal_calories.keys()), values=[round(value, 2) for value in meal_calories.values()]),
        meal_protein=ChartData(labels=list(meal_protein.keys()), values=[round(value, 2) for value in meal_protein.values()]),
        top_protein_foods=[
            NutritionFoodItem(
                food_item=row.get("Food_Item", ""),
                meal_type=row.get("Meal_Type", ""),
                category=row.get("Category", ""),
                calories=round(_to_float(row.get("Calories (kcal)")), 2),
                protein_g=round(_to_float(row.get("Protein (g)")), 2),
                carbohydrates_g=round(_to_float(row.get("Carbohydrates (g)")), 2),
                fat_g=round(_to_float(row.get("Fat (g)")), 2),
            )
            for row in top_foods
        ],
    )


def _average_by_group(rows: list[dict[str, str]], group_key: str, value_key: str) -> ChartData:
    grouped: dict[str, list[float]] = {}
    for row in rows:
        label = row.get(group_key) or "Unknown"
        grouped.setdefault(label, []).append(_to_float(row.get(value_key)))
    labels = list(grouped.keys())
    return ChartData(labels=labels, values=[_average(grouped[label]) for label in labels])


def _build_shap_summary() -> list[ModelFeatureImpact]:
    metadata_path = settings.MODEL_DIR / "week2_model_metadata.json"
    metadata: dict[str, object] = {}
    if metadata_path.exists():
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            metadata = {}

    classifier_features = list(metadata.get("classifier_features") or [])
    shap_notes = metadata.get("shap_notes") if isinstance(metadata.get("shap_notes"), dict) else {}
    explanation_mode = str(shap_notes.get("classification") if isinstance(shap_notes, dict) else "fallback")
    priority = {
        "avg_bpm": 0.96,
        "resting_bpm": 0.88,
        "workout_frequency_days_week": 0.78,
        "experience_level": 0.70,
        "bmi": 0.64,
        "water_intake_liters": 0.50,
        "fat_percentage": 0.44,
        "age": 0.38,
    }
    readable = {
        "avg_bpm": "Higher average BPM usually pushes predicted intensity upward.",
        "resting_bpm": "Higher resting BPM can signal recovery risk and affect intensity confidence.",
        "workout_frequency_days_week": "More weekly sessions suggest stronger training tolerance.",
        "experience_level": "Higher experience level supports more advanced intensity patterns.",
        "bmi": "BMI helps contextualize load and movement-risk assumptions.",
        "water_intake_liters": "Hydration proxy is included as a model feature for readiness context.",
        "fat_percentage": "Body composition proxy influences the model feature row.",
        "age": "Age provides baseline physiological context for the model.",
    }
    ordered = sorted(classifier_features or priority.keys(), key=lambda feature: priority.get(feature, 0.2), reverse=True)

    return [
        ModelFeatureImpact(
            feature=feature,
            impact=round(priority.get(feature, 0.2), 2),
            direction="positive" if feature in {"avg_bpm", "workout_frequency_days_week", "experience_level"} else "context",
            explanation=f"{readable.get(feature, 'Feature is part of the saved classifier pipeline.')} Mode: {explanation_mode}.",
        )
        for feature in ordered[:8]
    ]


def _build_exercise_plan_dashboard(filtered_rows: list[dict[str, str]], body_part_counts: dict[str, int], equipment_counts: dict[str, int]) -> ExercisePlanDashboardSection:
    calories = [_to_float(row.get("calories_burned")) for row in filtered_rows]
    durations = [_to_float(row.get("duration_minutes")) for row in filtered_rows]
    workouts = {row.get("workout_type") for row in filtered_rows if row.get("workout_type")}

    return ExercisePlanDashboardSection(
        kpis={
            "selected_sessions": len(filtered_rows),
            "workout_types": len(workouts),
            "avg_calories": _average(calories),
            "avg_duration_minutes": _average(durations),
        },
        workout_mix=_chart_from_counter(Counter(row.get("workout_type") or "Unknown" for row in filtered_rows), limit=8),
        calories_by_workout=_average_by_group(filtered_rows, "workout_type", "calories_burned"),
        duration_by_workout=_average_by_group(filtered_rows, "workout_type", "duration_minutes"),
        body_part_coverage=_chart_from_counts(
            body_part_counts,
            {"chest": 180, "back": 210, "upper legs": 240, "upper arms": 160, "shoulders": 130, "waist": 150},
        ),
        equipment_coverage=_chart_from_counts(
            equipment_counts,
            {"body weight": 220, "dumbbell": 180, "barbell": 140, "cable": 120, "machine": 160},
        ),
        shap_summary=_build_shap_summary(),
    )


def _build_source_graphs() -> dict[str, SourceGraph]:
    readiness_nodes = [
        SourceGraphNode(id="profile", label="User Profile", group="input"),
        SourceGraphNode(id="sleep", label="Sleep Hours", group="signal"),
        SourceGraphNode(id="stress", label="Stress Level", group="signal"),
        SourceGraphNode(id="bp", label="Blood Pressure", group="signal"),
        SourceGraphNode(id="hr", label="Resting HR", group="signal"),
        SourceGraphNode(id="bmi", label="BMI", group="signal"),
        SourceGraphNode(id="score", label="Readiness Score", group="score"),
        SourceGraphNode(id="band", label="Readiness Band", group="output"),
        SourceGraphNode(id="cap", label="Safety / Volume Cap", group="decision"),
    ]
    intensity_nodes = [
        SourceGraphNode(id="profile", label="User Profile", group="input"),
        SourceGraphNode(id="body", label="Body Metrics", group="signal"),
        SourceGraphNode(id="goal", label="Goal + Frequency", group="signal"),
        SourceGraphNode(id="target", label="Target Body Part", group="signal"),
        SourceGraphNode(id="equipment", label="Equipment", group="signal"),
        SourceGraphNode(id="features", label="ML Feature Row", group="score"),
        SourceGraphNode(id="model", label="XGBoost Classifier", group="model"),
        SourceGraphNode(id="probability", label="Class Probabilities", group="score"),
        SourceGraphNode(id="output", label="Predicted Intensity", group="output"),
    ]

    return {
        "readiness": SourceGraph(
            title="Readiness Source Graph",
            nodes=readiness_nodes,
            edges=[
                SourceGraphEdge(source="profile", target="sleep", label="provides"),
                SourceGraphEdge(source="profile", target="stress", label="provides"),
                SourceGraphEdge(source="profile", target="bp", label="provides"),
                SourceGraphEdge(source="profile", target="hr", label="provides"),
                SourceGraphEdge(source="profile", target="bmi", label="provides"),
                SourceGraphEdge(source="sleep", target="score", label="deducts if low"),
                SourceGraphEdge(source="stress", target="score", label="deducts if high"),
                SourceGraphEdge(source="bp", target="score", label="safety risk"),
                SourceGraphEdge(source="hr", target="score", label="recovery risk"),
                SourceGraphEdge(source="bmi", target="score", label="impact control"),
                SourceGraphEdge(source="score", target="band", label="maps to Low/Medium/High"),
                SourceGraphEdge(source="band", target="cap", label="adjusts plan volume"),
            ],
        ),
        "intensity": SourceGraph(
            title="Intensity Source Graph",
            nodes=intensity_nodes,
            edges=[
                SourceGraphEdge(source="profile", target="body", label="age/height/weight"),
                SourceGraphEdge(source="profile", target="goal", label="training intent"),
                SourceGraphEdge(source="profile", target="target", label="focus area"),
                SourceGraphEdge(source="profile", target="equipment", label="constraints"),
                SourceGraphEdge(source="body", target="features", label="model input"),
                SourceGraphEdge(source="goal", target="features", label="model input"),
                SourceGraphEdge(source="target", target="features", label="model input"),
                SourceGraphEdge(source="equipment", target="features", label="model input"),
                SourceGraphEdge(source="features", target="model", label="predicts"),
                SourceGraphEdge(source="model", target="probability", label="class scores"),
                SourceGraphEdge(source="probability", target="output", label="highest class"),
            ],
        ),
    }


def _build_dashboard_workspace(
    body_part_counts: dict[str, int],
    equipment_counts: dict[str, int],
    start_month: str | None = None,
    end_month: str | None = None,
    months: str | None = None,
    locations: str | None = None,
    gender: str | None = None,
) -> DashboardWorkspaceSection:
    session_rows = read_processed_csv_rows("gymdb_fact_sessions_sample.csv")
    selected_months = _parse_months(months)
    filtered_rows = _filter_session_rows(
        session_rows,
        None if selected_months else start_month,
        None if selected_months else end_month,
        selected_months,
        _parse_locations(locations),
        gender,
    )

    return DashboardWorkspaceSection(
        filter_options=_build_filter_options(session_rows),
        executive_summary=_build_executive_summary(filtered_rows),
        user_info=_build_user_info(filtered_rows),
        nutrition_plan=_build_nutrition_plan(),
        exercise_plan=_build_exercise_plan_dashboard(filtered_rows, body_part_counts, equipment_counts),
        source_graphs=_build_source_graphs(),
    )


def get_summary(
    start_month: str | None = None,
    end_month: str | None = None,
    months: str | None = None,
    location: str | None = None,
    locations: str | None = None,
    gender: str | None = None,
) -> DashboardSummaryResponse:
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
        dashboard_workspace=_build_dashboard_workspace(
            body_part_counts,
            equipment_counts,
            start_month=start_month,
            end_month=end_month,
            months=months,
            locations=locations or location,
            gender=gender,
        ),
    )
