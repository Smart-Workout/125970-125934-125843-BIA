INTENSITY_RULES = {                                                         # Rule table converts predicted intensity into workout-plan settings.
    "Low": {
        "sets": 2,                                                          # Low intensity uses lower training volume.
        "reps": "10-12",                                                    # Higher controlled reps support lighter effort sessions.
        "rest_seconds": 75,                                                 # Short-moderate rest keeps the session gentle but structured.
        "volume_note": "Reduce volume and keep movements controlled.",      # Note explains the plan adjustment for low readiness.
    },
    "Medium": {
        "sets": 3,                                                          # Medium intensity uses standard training volume.
        "reps": "8-12",                                                     # Moderate rep range supports general fitness goals.
        "rest_seconds": 90,                                                 # Moderate rest balances effort and recovery.
        "volume_note": "Use moderate volume with stable technique.",        # Note explains the default plan intensity.
    },
    "High": {
        "sets": 4,                                                          # High intensity allows more training volume.
        "reps": "6-10",                                                     # Lower rep range supports heavier or harder sets.
        "rest_seconds": 120,                                                # Longer rest supports higher effort work.
        "volume_note": "Use higher load or volume when readiness is high.", # Note explains the plan adjustment for high readiness.
    },
}
