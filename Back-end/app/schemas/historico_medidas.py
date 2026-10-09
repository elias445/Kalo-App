from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HistoricoMedidasBase(BaseModel):
    peso_kg: float
    percentual_gordura: Optional[float] = None

class HistoricoMedidasCreate(HistoricoMedidasBase):
    usuario_id: str

class HistoricoMedidasResponse(HistoricoMedidasBase):
    id: str
    usuario_id: str
    data_registro: datetime

    class Config:
        from_attributes = True