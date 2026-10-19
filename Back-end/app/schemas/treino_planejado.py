from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TreinoPlanejadoBase(BaseModel):
    dia_semana: str
    grupo_muscular: str
    nome_exercicio: str
    wger_exercicio_id: Optional[int] = None
    series_planejadas: str
    ordem: int

# Dados recebidos ao criar um exercício planejado
class TreinoPlanejadoCreate(TreinoPlanejadoBase):
    usuario_id: UUID

# Dados devolvidos ao app
class TreinoPlanejadoResponse(TreinoPlanejadoBase):
    id: UUID
    usuario_id: UUID

    class Config:
        from_attributes = True