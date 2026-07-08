from __future__ import annotations

from typing import Any

from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.utils.class_weight import compute_sample_weight

try:
    from xgboost import XGBClassifier
except ImportError:  # pragma: no cover
    XGBClassifier = None  # type: ignore[assignment,misc]


class BalancedXGBClassifier(BaseEstimator, ClassifierMixin):
    """XGBClassifier that computes balanced sample weights on every fit() call.

    The intensity_band label is skewed (Mid 52%, High 31%, Low 16%). Training
    without compensation causes the model to almost never predict Low or High.
    Weights are computed inside fit() so cross_val_predict recomputes them per
    fold rather than applying full-dataset ratios to each subset.

    Defined in a shared module (not __main__) so joblib can deserialize the
    saved pipeline in any context — training script and backend service alike.
    """

    def __init__(
        self,
        n_estimators: int = 300,
        learning_rate: float = 0.05,
        max_depth: int = 4,
        subsample: float = 0.9,
        colsample_bytree: float = 0.9,
        objective: str = "multi:softprob",
        eval_metric: str = "mlogloss",
        random_state: int = 42,
        n_jobs: int = -1,
    ) -> None:
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.subsample = subsample
        self.colsample_bytree = colsample_bytree
        self.objective = objective
        self.eval_metric = eval_metric
        self.random_state = random_state
        self.n_jobs = n_jobs

    def fit(self, X: Any, y: Any, **kwargs: Any) -> "BalancedXGBClassifier":
        sample_weight = compute_sample_weight("balanced", y)
        self.clf_ = XGBClassifier(**self.get_params())
        self.clf_.fit(X, y, sample_weight=sample_weight, **kwargs)
        return self

    def predict(self, X: Any) -> Any:
        return self.clf_.predict(X)

    def predict_proba(self, X: Any) -> Any:
        return self.clf_.predict_proba(X)

    @property
    def feature_importances_(self) -> Any:
        return self.clf_.feature_importances_
