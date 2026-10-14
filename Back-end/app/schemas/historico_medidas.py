from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional

class HistoricoMedidasBase(BaseModel):
    peso_kg: float
    percentual_gordura: Optional[float] = None

class HistoricoMedidasCreate(HistoricoMedidasBase):
    usuario_id: UUID4

class HistoricoMedidasResponse(HistoricoMedidasBase):
    id: UUID4
    usuario_id: UUID4
    data_registro: datetime

    class Config:
        from_attributes = True