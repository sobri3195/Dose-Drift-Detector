from typing import List

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Dose-Drift Detector API",
    description="API sederhana untuk estimasi pergeseran dosis harian pada pasien radioterapi.",
    version="0.1.0",
)


class DailyMetrics(BaseModel):
    day: int = Field(..., ge=1, description="Hari fraksi radioterapi")
    target_volume_change_pct: float = Field(
        ..., description="Perubahan volume target (%) dibanding baseline"
    )
    setup_error_mm: float = Field(..., ge=0, description="Galat setup pasien (mm)")
    weight_loss_pct: float = Field(..., ge=0, description="Penurunan berat badan (%)")


class AnalysisRequest(BaseModel):
    patient_id: str
    fraction_site: str = Field(..., description="Contoh: H&N, cervix")
    daily_metrics: List[DailyMetrics] = Field(
        ..., min_length=1, description="Data anatomi harian dari CBCT"
    )


class AnalysisResponse(BaseModel):
    patient_id: str
    estimated_d95_drop_pct: float
    estimated_oar_overdose_risk_pct: float
    trigger_replanning: bool
    summary: str


def estimate_dose_drift_score(metric: DailyMetrics) -> float:
    """Skor heuristik sederhana untuk dose drift."""
    return (
        abs(metric.target_volume_change_pct) * 0.5
        + metric.setup_error_mm * 2.0
        + metric.weight_loss_pct * 1.2
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    scores = [estimate_dose_drift_score(item) for item in request.daily_metrics]
    avg_score = sum(scores) / len(scores)

    estimated_d95_drop = round(min(avg_score * 0.8, 30.0), 2)
    estimated_oar_risk = round(min(avg_score * 1.1, 45.0), 2)
    trigger = estimated_d95_drop >= 5.0 or estimated_oar_risk >= 10.0

    if trigger:
        summary = (
            "AI mendeteksi potensi dose drift bermakna. "
            "Pertimbangkan adaptive replanning lebih awal."
        )
    else:
        summary = "Perubahan masih dalam batas aman, lanjutkan evaluasi periodik."

    return AnalysisResponse(
        patient_id=request.patient_id,
        estimated_d95_drop_pct=estimated_d95_drop,
        estimated_oar_overdose_risk_pct=estimated_oar_risk,
        trigger_replanning=trigger,
        summary=summary,
    )
