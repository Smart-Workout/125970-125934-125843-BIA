from pydantic import BaseModel


class ChartData(BaseModel):
    labels: list[str]
    values: list[float]


class RetrievedSnippet(BaseModel):
    source: str
    category: str
    text: str

