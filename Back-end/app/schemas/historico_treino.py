from pydantic import BaseModel
from uuid import UUID
from datetime import date
from typing import Optional

class HistoricoTreinoBase(BaseModel):
    data_treino: date
    carga_kg: Optional[float] = None
    concluido: bool = False

# Dados recebidos ao registrar um treino
class HistoricoTreinoCreate(HistoricoTreinoBase):
    usuario_id: UUID
    treino_planejado_id: UUID

# Dados devolvidos ao app
class HistoricoTreinoResponse(HistoricoTreinoBase):
    id: UUID
    usuario_id: UUID
    treino_planejado_id: UUID

    class Config:
        from_attributes = True