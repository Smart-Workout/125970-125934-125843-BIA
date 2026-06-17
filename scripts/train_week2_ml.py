from __future__ import annotations

import json                                                                 # Save model metadata and report-ready configuration values.
from dataclasses import dataclass                                            # Store model result fields in a readable structure.
from pathlib import Path                                                     # Build project paths that work from scripts, notebooks, or terminal.
from typing import Any                                                       # Type flexible sklearn objects without hiding the pipeline structure.

import joblib                                                               # Persist the selected trained pipelines as reusable model artifacts.
import matplotlib.pyplot as plt                                             # Create confusion matrix and explanation PNG outputs.
import numpy as np                                                          # Support numeric arrays, RMSE fallback, and label conversion.
import pandas as pd                                                         # Load processed datasets and save validation/result tables.
import seaborn as sns                                                       # Create polished feature-importance fallback plots.
from sklearn.compose import ColumnTransformer                               # Apply numeric and categorical preprocessing in one pipeline.
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor  # Train non-linear tree baselines for both Week 2 ML tasks.
from sklearn.impute import SimpleImputer                                    # Fill missing values safely inside cross-validation folds.
from sklearn.linear_model import LogisticRegression, Ridge                  # Train linear baseline models required by the Week 2 TODO.
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_predict # Run reproducible 5-fold evaluation before final model fitting.
from sklearn.pipeline import Pipeline                                        # Combine preprocessing and model steps into one deployable object.
from sklearn.preprocessing import OneHotEncoder, StandardScaler              # Encode categories and scale linear-model numeric features.

try:
    from xgboost import XGBClassifier, XGBRegressor
except ImportError:  # pragma: no cover - script can still run without xgboost installed.
    XGBClassifier = None
    XGBRegressor = None

try:
    import shap
except ImportError:  # pragma: no cover - SHAP is optional until dependencies are installed.
    shap = None


RANDOM_STATE = 42                                                            # Fixed seed makes cross-validation and model comparison reproducible.
N_SPLITS = 5                                                                 # Week 2 TODO requires 5-fold cross-validation.
INTENSITY_LABEL_TO_ID = {"Low": 0, "Mid": 1, "High": 2}                      # XGBoost classification works most reliably with numeric labels.
INTENSITY_ID_TO_LABEL = {value: key for key, value in INTENSITY_LABEL_TO_ID.items()} # Numeric predictions are converted back to dashboard labels.


@dataclass
class ModelResult:
    task: str                                                                # Task name separates regression results from classification results.
    model_name: str                                                          # Human-readable model name used in MODEL_RESULTS.md.
    metrics: dict[str, float]                                                # Evaluation scores are stored together for table generation.
    selected: bool = False                                                   # Selected flag marks the best model after comparison.


def find_project_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()                                # Start search from the current notebook/script location.
    for candidate in [current, *current.parents]:
        if (candidate / "data" / "processed" / "gym_cleaned_intensity_calories.csv").exists():
            return candidate                                                 # Project root is the folder containing the processed Week 1 gym dataset.
    raise FileNotFoundError("Could not find project root with data/processed/gym_cleaned_intensity_calories.csv")


def one_hot_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)   # Newer sklearn uses sparse_output for dense encoded features.
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)          # Older sklearn uses sparse, so this keeps the script version-safe.


def make_preprocessor(
    numeric_features: list[str],
    categorical_features: list[str],
    scale_numeric: bool,
) -> ColumnTransformer:
    numeric_steps: list[tuple[str, Any]] = [("imputer", SimpleImputer(strategy="median"))] # Numeric missing values are filled with robust medians.
    if scale_numeric:
        numeric_steps.append(("scaler", StandardScaler()))                   # Ridge and Logistic Regression need scaled numeric inputs.

    numeric_pipeline = Pipeline(numeric_steps)                               # Numeric preprocessing is grouped as one reusable pipeline branch.
    categorical_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),           # Category blanks are filled before one-hot encoding.
            ("onehot", one_hot_encoder()),                                  # Text categories become model-readable binary indicator columns.
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_features),
            ("cat", categorical_pipeline, categorical_features),
        ],
        remainder="drop",                                                    # Only selected non-leakage features enter each model.
        verbose_feature_names_out=False,                                     # Cleaner feature names improve SHAP and feature-importance plots.
    )


def feature_names_from_pipeline(pipeline: Pipeline) -> list[str]:
    preprocessor = pipeline.named_steps["preprocess"]                        # Feature names come from the fitted preprocessing step.
    try:
        return list(preprocessor.get_feature_names_out())                    # Encoded names help explain which variables drive predictions.
    except Exception:
        return [f"feature_{index}" for index in range(preprocessor.transformers_[0][2].__len__())] # Fallback names keep plotting from failing.


def regression_rmse(y_true: pd.Series, y_pred: np.ndarray) -> float:
    try:
        return float(mean_squared_error(y_true, y_pred, squared=False))      # Newer sklearn can return RMSE directly.
    except TypeError:
        return float(np.sqrt(mean_squared_error(y_true, y_pred)))            # Older sklearn needs square root after MSE.


def evaluate_regression_model(
    name: str,
    pipeline: Pipeline,
    x: pd.DataFrame,
    y: pd.Series,
    cv: KFold,
) -> tuple[ModelResult, np.ndarray]:
    predictions = cross_val_predict(pipeline, x, y, cv=cv, n_jobs=-1)        # Each prediction comes from a model that did not train on that row.
    metrics = {
        "RMSE": regression_rmse(y, predictions),                            # RMSE penalizes large calorie-rate errors strongly.
        "MAE": float(mean_absolute_error(y, predictions)),                   # MAE gives an easier average-error interpretation.
        "R2": float(r2_score(y, predictions)),                               # R2 shows how much target variance the model explains.
    }
    return ModelResult("Calorie-burn-rate regression", name, metrics), predictions # ModelResult feeds MODEL_RESULTS.md.


def evaluate_classifier_model(
    name: str,
    pipeline: Pipeline,
    x: pd.DataFrame,
    y: pd.Series,
    cv: StratifiedKFold,
) -> tuple[ModelResult, np.ndarray, np.ndarray]:
    predictions = cross_val_predict(pipeline, x, y, cv=cv, n_jobs=-1)        # Stratified CV keeps Low/Mid/High proportions stable across folds.
    labels = np.array([0, 1, 2])                                             # Confusion matrix order matches Low, Mid, High.
    metrics = {
        "Accuracy": float(accuracy_score(y, predictions)),                   # Accuracy counts the total share of correct intensity predictions.
        "Macro-F1": float(f1_score(y, predictions, average="macro")),        # Macro-F1 treats each class equally, even if classes are imbalanced.
    }
    matrix = confusion_matrix(y, predictions, labels=labels)                 # Matrix shows which intensity bands are confused with each other.
    return ModelResult("Workout-intensity classification", name, metrics), predictions, matrix


def decode_intensity(values: pd.Series | np.ndarray) -> list[str]:
    return [INTENSITY_ID_TO_LABEL[int(value)] for value in values]           # Numeric model outputs become readable labels in saved CSV files.


def save_confusion_matrix(
    matrix: np.ndarray,
    labels: list[str],
    title: str,
    output_path: Path,
) -> None:
    display = ConfusionMatrixDisplay(confusion_matrix=matrix, display_labels=labels) # sklearn handles labeled confusion matrix rendering.
    display.plot(cmap="Blues", values_format="d")                            # Integer counts are easier to inspect than normalized values here.
    plt.title(title)                                                          # Plot title identifies the model being evaluated.
    plt.tight_layout()                                                        # Tight layout prevents labels from being clipped.
    plt.savefig(output_path, dpi=160, bbox_inches="tight")                    # PNG output is saved for report and dashboard documentation.
    plt.close()                                                               # Close figure to avoid memory buildup during repeated plotting.


def transformed_sample(pipeline: Pipeline, x: pd.DataFrame, sample_size: int = 200) -> tuple[np.ndarray, list[str]]:
    sample = x.sample(min(sample_size, len(x)), random_state=RANDOM_STATE)   # SHAP uses a stable sample to keep explanation runtime reasonable.
    preprocessor = pipeline.named_steps["preprocess"]                        # The fitted preprocessor transforms raw columns into model features.
    transformed = preprocessor.transform(sample)                             # Explanation must use the same feature space seen by the model.
    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()                                  # Sparse one-hot output is converted for SHAP compatibility.
    return np.asarray(transformed), feature_names_from_pipeline(pipeline)     # Array and feature names travel together into the explanation plot.


def save_shap_or_fallback_plot(
    pipeline: Pipeline,
    x: pd.DataFrame,
    output_path: Path,
    title: str,
) -> str:
    estimator = pipeline.named_steps["model"]                                # The final estimator is the part explained by SHAP or fallback importances.
    x_transformed, feature_names = transformed_sample(pipeline, x)            # Raw input is converted into the fitted model feature space.

    if shap is not None:
        try:
            explainer = shap.Explainer(estimator, x_transformed, feature_names=feature_names) # SHAP estimates feature contribution direction and strength.
            values = explainer(x_transformed)                              # SHAP values are computed on the transformed feature matrix.
            shap.plots.bar(values, max_display=15, show=False)             # Bar plot summarizes the strongest global feature drivers.
            plt.title(title)                                                # Title connects the explanation artifact to the selected model.
            plt.tight_layout()                                              # Layout cleanup improves readability in exported PNG files.
            plt.savefig(output_path, dpi=160, bbox_inches="tight")          # SHAP plot is saved for Week 2 documentation.
            plt.close()                                                     # Figure is closed after export.
            return "shap"                                                   # Metadata records that a real SHAP plot was produced.
        except Exception as exc:  # noqa: BLE001 - fallback should keep the pipeline usable.
            print(f"SHAP failed for {title}: {exc}")                         # SHAP incompatibility should not block the final product artifact.

    if hasattr(estimator, "feature_importances_"):
        importances = estimator.feature_importances_                         # Tree models expose built-in feature importance values.
    elif hasattr(estimator, "coef_"):
        importances = np.abs(np.asarray(estimator.coef_)).mean(axis=0)       # Linear models use average absolute coefficients as a fallback.
    else:
        importances = np.zeros(len(feature_names))                           # Empty importance values keep the plot pipeline stable.

    importance_df = (
        pd.DataFrame({"feature": feature_names, "importance": importances})  # Importance values become a table before plotting.
        .sort_values("importance", ascending=False)                         # Most influential features appear at the top.
        .head(15)                                                            # Top 15 keeps the visual compact enough for reports.
    )
    plt.figure(figsize=(9, 5))                                                # Fixed figure size keeps generated PNGs consistent.
    sns.barplot(data=importance_df, x="importance", y="feature", color="#70B7A0") # Horizontal bars make long feature names readable.
    plt.title(f"{title} - fallback feature importance")                       # Title makes clear that this is a fallback explanation.
    plt.tight_layout()                                                        # Prevent label clipping.
    plt.savefig(output_path, dpi=160, bbox_inches="tight")                    # Fallback explanation is saved to the same expected artifact path.
    plt.close()                                                               # Close figure after saving.
    return "fallback"                                                         # Metadata records that fallback importance was used.


def model_results_markdown(
    regression_results: list[ModelResult],
    classifier_results: list[ModelResult],
    selected_regression: ModelResult,
    selected_classifier: ModelResult,
    shap_notes: dict[str, str],
) -> str:
    reg_rows = "\n".join(                                                     # Regression rows become a Markdown comparison table.
        f"| {r.model_name} | {r.metrics['RMSE']:.3f} | {r.metrics['MAE']:.3f} | {r.metrics['R2']:.3f} | {'yes' if r.selected else ''} |"
        for r in regression_results
    )
    clf_rows = "\n".join(                                                     # Classification rows become a Markdown comparison table.
        f"| {r.model_name} | {r.metrics['Accuracy']:.3f} | {r.metrics['Macro-F1']:.3f} | {'yes' if r.selected else ''} |"
        for r in classifier_results
    )
    return f"""# Week 2 Model Results

Generated by `scripts/train_week2_ml.py`.

## Data

- Source: `data/processed/gym_cleaned_intensity_calories.csv`
- Regression target: `calorie_burn_rate_kcal_per_hour`
- Regression excluded feature: `session_duration_hours`
- Classification target: `intensity_band`
- Cross-validation: 5-fold, `random_state=42`

## Calorie-Burn-Rate Regression

| Model | RMSE | MAE | R2 | Selected |
|---|---:|---:|---:|---|
{reg_rows}

Selected model: **{selected_regression.model_name}**

## Workout-Intensity Classification

| Model | Accuracy | Macro-F1 | Selected |
|---|---:|---:|---|
{clf_rows}

Selected model: **{selected_classifier.model_name}**

## Saved Artifacts

- `models/best_calorie_regressor.joblib`
- `models/best_intensity_classifier.joblib`
- `models/week2_model_metadata.json`
- `docs/figures/week2/`

## Explainability Notes

- Regression explanation plot mode: `{shap_notes.get('regression')}`
- Classification explanation plot mode: `{shap_notes.get('classification')}`

If SHAP dependencies are unavailable or incompatible, the script saves a fallback feature-importance plot so the reporting workflow still has an inspectable explanation artifact.
"""


def main() -> None:
    project_root = find_project_root()                                        # Root detection allows the script to run from terminal or notebook cells.
    data_path = project_root / "data" / "processed" / "gym_cleaned_intensity_calories.csv" # Week 1 cleaned gym dataset feeds Week 2 ML.
    models_dir = project_root / "models"                                      # Selected model artifacts and CV tables are stored here.
    figures_dir = project_root / "docs" / "figures" / "week2"                 # Report-ready model explanation images are stored here.
    models_dir.mkdir(parents=True, exist_ok=True)                             # Artifact folder is created only when training is executed.
    figures_dir.mkdir(parents=True, exist_ok=True)                            # Figure folder is created before saving PNG files.

    df = pd.read_csv(data_path)                                               # Load the validated Week 1 processed gym dataset.

    regression_target = "calorie_burn_rate_kcal_per_hour"                    # Target predicts workout burn efficiency instead of raw session calories.
    regression_excluded = {
        regression_target,                                                    # Target must not be reused as a feature.
        "session_duration_hours",                                             # TODO requires duration to be excluded from calorie-burn-rate features.
        "calories_burned",                                                    # Raw calories would leak the derived target.
        "calories_burned_clean",                                              # Cleaned calories would also leak the derived target.
        "calories_burned_zscore",                                             # Outlier diagnostic should not become a predictive input.
        "calorie_outlier_3sigma",                                             # Outlier flag is a cleaning proof column, not a model feature.
    }
    classifier_target = "intensity_band"                                      # Target predicts Low/Mid/High workout intensity band.
    classifier_excluded = regression_excluded | {
        classifier_target,                                                    # Class label must not be reused as a feature.
        "bpm_response_ratio",                                                 # Intensity band was derived from BPM ratio, so this would leak the answer.
        "avg_bpm",                                                            # Average BPM is part of the target derivation path.
        "max_bpm",                                                            # Max BPM is part of the target derivation path.
    }

    regression_features = [col for col in df.columns if col not in regression_excluded] # Remaining columns form the regression feature set.
    classifier_features = [col for col in df.columns if col not in classifier_excluded] # Remaining columns form the classification feature set.

    x_reg = df[regression_features].copy()                                    # Regression feature matrix.
    y_reg = df[regression_target].copy()                                      # Regression target vector.
    x_clf = df[classifier_features].copy()                                    # Classification feature matrix.
    y_clf = df[classifier_target].map(INTENSITY_LABEL_TO_ID).astype(int)      # Text classes are encoded for model training.

    reg_numeric = x_reg.select_dtypes(include=["number", "bool"]).columns.tolist() # Numeric regression columns receive imputation and optional scaling.
    reg_categorical = [col for col in x_reg.columns if col not in reg_numeric] # Categorical regression columns receive imputation and one-hot encoding.
    clf_numeric = x_clf.select_dtypes(include=["number", "bool"]).columns.tolist() # Numeric classifier columns receive imputation and optional scaling.
    clf_categorical = [col for col in x_clf.columns if col not in clf_numeric] # Categorical classifier columns receive imputation and one-hot encoding.

    regression_models: dict[str, Pipeline] = {
        "Ridge Regression": Pipeline(
            [
                ("preprocess", make_preprocessor(reg_numeric, reg_categorical, scale_numeric=True)), # StandardScaler is required for fair Ridge coefficients.
                ("model", Ridge(alpha=1.0)),                                      # Ridge is the regularized linear regression baseline.
            ]
        ),
        "Random Forest Regressor": Pipeline(
            [
                ("preprocess", make_preprocessor(reg_numeric, reg_categorical, scale_numeric=False)), # Tree models do not need scaled numeric values.
                ("model", RandomForestRegressor(n_estimators=300, random_state=RANDOM_STATE, n_jobs=-1)), # Forest captures non-linear calorie-rate patterns.
            ]
        ),
    }
    if XGBRegressor is not None:
        regression_models["XGBoost Regressor"] = Pipeline(                    # XGBoost is added only when the optional dependency is installed.
            [
                ("preprocess", make_preprocessor(reg_numeric, reg_categorical, scale_numeric=False)), # Boosted trees use encoded categories but no scaling.
                (
                    "model",
                    XGBRegressor(
                        n_estimators=300,                                      # More trees improve boosted-model learning capacity.
                        learning_rate=0.05,                                    # Small learning rate makes boosting more stable.
                        max_depth=4,                                           # Moderate depth limits overfitting on a small gym dataset.
                        subsample=0.9,                                         # Row sampling improves generalization.
                        colsample_bytree=0.9,                                  # Feature sampling improves generalization.
                        objective="reg:squarederror",                         # Squared-error objective matches regression target.
                        random_state=RANDOM_STATE,                             # Seed keeps training reproducible.
                        n_jobs=-1,                                             # Use available CPU cores.
                    ),
                ),
            ]
        )

    classifier_models: dict[str, Pipeline] = {
        "Multinomial Logistic Regression": Pipeline(
            [
                ("preprocess", make_preprocessor(clf_numeric, clf_categorical, scale_numeric=True)), # Logistic Regression needs scaled numeric values.
                ("model", LogisticRegression(max_iter=3000, solver="lbfgs")),   # Multiclass logistic regression is the linear classifier baseline.
            ]
        ),
        "Random Forest Classifier": Pipeline(
            [
                ("preprocess", make_preprocessor(clf_numeric, clf_categorical, scale_numeric=False)), # Scaling is unnecessary for Random Forest.
                ("model", RandomForestClassifier(n_estimators=300, random_state=RANDOM_STATE, n_jobs=-1)), # Forest tests non-linear intensity signals.
            ]
        ),
    }
    if XGBClassifier is not None:
        classifier_models["XGBoost Classifier"] = Pipeline(                  # XGBoost classifier is included when dependency installation succeeds.
            [
                ("preprocess", make_preprocessor(clf_numeric, clf_categorical, scale_numeric=False)), # Boosted trees need encoding but not scaling.
                (
                    "model",
                    XGBClassifier(
                        n_estimators=300,                                      # Boosting rounds build many small corrective trees.
                        learning_rate=0.05,                                    # Small learning rate reduces unstable updates.
                        max_depth=4,                                           # Moderate tree depth controls overfitting.
                        subsample=0.9,                                         # Row sampling improves generalization.
                        colsample_bytree=0.9,                                  # Column sampling improves generalization.
                        objective="multi:softprob",                           # Softprob supports three intensity classes.
                        eval_metric="mlogloss",                               # Multiclass log loss is a stable training metric.
                        random_state=RANDOM_STATE,                             # Seed keeps results reproducible.
                        n_jobs=-1,                                             # Use available CPU cores.
                    ),
                ),
            ]
        )

    reg_cv = KFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE) # Regression CV shuffles rows for balanced fold coverage.
    clf_cv = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE) # Stratified CV preserves class proportions per fold.

    regression_results: list[ModelResult] = []
    for name, pipeline in regression_models.items():
        result, predictions = evaluate_regression_model(name, pipeline, x_reg, y_reg, reg_cv) # Model is evaluated with out-of-fold predictions.
        regression_results.append(result)                                  # Metrics are collected for comparison and report generation.
        pd.DataFrame({"actual": y_reg, "predicted": predictions}).to_csv(
            models_dir / f"{name.lower().replace(' ', '_')}_regression_cv_predictions.csv",
            index=False,                                                     # Saved predictions allow manual error inspection later.
        )

    classifier_results: list[ModelResult] = []
    for name, pipeline in classifier_models.items():
        result, predictions, matrix = evaluate_classifier_model(name, pipeline, x_clf, y_clf, clf_cv) # Classifier receives stratified out-of-fold evaluation.
        classifier_results.append(result)                                   # Metrics are collected for model selection.
        slug = name.lower().replace(" ", "_")                               # Slug makes output filenames stable and readable.
        pd.DataFrame({"actual": decode_intensity(y_clf), "predicted": decode_intensity(predictions)}).to_csv(
            models_dir / f"{slug}_classification_cv_predictions.csv",
            index=False,                                                     # Decoded labels keep validation tables presentation-friendly.
        )
        pd.DataFrame(matrix, index=["Low", "Mid", "High"], columns=["Low", "Mid", "High"]).to_csv(
            models_dir / f"{slug}_confusion_matrix.csv",                    # Matrix CSV supports report tables and manual QA.
        )
        save_confusion_matrix(
            matrix,                                                          # Numeric matrix created from out-of-fold predictions.
            ["Low", "Mid", "High"],                                          # Display labels restore human-readable class names.
            f"{name} Confusion Matrix",                                      # Plot title identifies the evaluated classifier.
            figures_dir / f"{slug}_confusion_matrix.png",                   # PNG is saved for presentation/report use.
        )

    selected_regression = min(regression_results, key=lambda item: item.metrics["RMSE"]) # Lowest RMSE wins the calorie-burn-rate task.
    selected_classifier = max(classifier_results, key=lambda item: item.metrics["Macro-F1"]) # Highest Macro-F1 wins the intensity task.
    for result in regression_results:
        result.selected = result.model_name == selected_regression.model_name # Selected flag appears in MODEL_RESULTS.md.
    for result in classifier_results:
        result.selected = result.model_name == selected_classifier.model_name # Selected flag appears in MODEL_RESULTS.md.

    best_regression_pipeline = regression_models[selected_regression.model_name].fit(x_reg, y_reg) # Final regressor trains on all available data after CV.
    best_classifier_pipeline = classifier_models[selected_classifier.model_name].fit(x_clf, y_clf) # Final classifier trains on all available data after CV.

    joblib.dump(
        {
            "model": best_regression_pipeline,                              # Complete preprocessing-plus-model pipeline is stored.
            "target": regression_target,                                     # Target name documents how the artifact should be used.
            "features": regression_features,                                 # Feature list prevents mismatched prediction inputs later.
            "metrics": selected_regression.metrics,                          # Best CV metrics travel with the saved model.
        },
        models_dir / "best_calorie_regressor.joblib",                       # Week 2 TODO artifact for calorie-burn-rate regression.
    )
    joblib.dump(
        {
            "model": best_classifier_pipeline,                               # Complete preprocessing-plus-model pipeline is stored.
            "target": classifier_target,                                     # Target name documents how the artifact should be used.
            "features": classifier_features,                                 # Feature list prevents mismatched prediction inputs later.
            "labels": ["Low", "Mid", "High"],                                # Label order supports dashboard display and confusion matrices.
            "label_mapping": INTENSITY_LABEL_TO_ID,                          # Mapping documents numeric encoding used during training.
            "metrics": selected_classifier.metrics,                          # Best CV metrics travel with the saved model.
        },
        models_dir / "best_intensity_classifier.joblib",                    # Week 2 TODO artifact for workout-intensity classification.
    )

    shap_notes = {
        "regression": save_shap_or_fallback_plot(
            best_regression_pipeline,                                        # Selected regression pipeline is explained.
            x_reg,                                                           # Raw training features are transformed inside the helper.
            figures_dir / "selected_calorie_regressor_shap.png",            # Explanation artifact path for the selected regressor.
            f"{selected_regression.model_name} explanation",                 # Plot title uses the winning model name.
        ),
        "classification": save_shap_or_fallback_plot(
            best_classifier_pipeline,                                        # Selected classifier pipeline is explained.
            x_clf,                                                           # Raw training features are transformed inside the helper.
            figures_dir / "selected_intensity_classifier_shap.png",          # Explanation artifact path for the selected classifier.
            f"{selected_classifier.model_name} explanation",                 # Plot title uses the winning model name.
        ),
    }

    metadata = {
        "random_state": RANDOM_STATE,                                        # Reproducibility settings are recorded for audit.
        "n_splits": N_SPLITS,                                                # CV fold count is recorded for audit.
        "regression_features": regression_features,                          # Regression feature set is recorded for deployment checks.
        "classifier_features": classifier_features,                          # Classification feature set is recorded for deployment checks.
        "selected_regression": selected_regression.__dict__,                 # Winning regression model metadata is stored.
        "selected_classifier": selected_classifier.__dict__,                 # Winning classifier model metadata is stored.
        "shap_notes": shap_notes,                                            # Explanation mode records whether SHAP or fallback was used.
    }
    (models_dir / "week2_model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8") # Metadata supports future API integration.

    results_md = model_results_markdown(
        regression_results,
        classifier_results,
        selected_regression,
        selected_classifier,
        shap_notes,
    )
    (project_root / "MODEL_RESULTS.md").write_text(results_md, encoding="utf-8") # Markdown report satisfies Week 2 comparison-table TODO.

    print(results_md)                                                          # Terminal output gives immediate feedback after training.


if __name__ == "__main__":
    main()
