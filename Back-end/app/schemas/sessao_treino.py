from datetime import date, datetime
from typing import List
from pydantic import BaseModel, Field, UUID4


# Dados recebidos ao registrar um treino concluído (o usuário vem do token)
class SessaoTreinoCreate(BaseModel):
    data_treino: date
    exercicios_concluidos: int = Field(..., ge=1, le=50)


# Dados devolvidos ao app
class SessaoTreinoResponse(BaseModel):
    id: UUID4
    data_treino: date
    dia_semana: str
    exercicios_planejados: int
    exercicios_concluidos: int
    concluido_em: datetime

    class Config:
        from_attributes = True


# Frequência de treino do mês: calendário, consistência e sequência
class FrequenciaResponse(BaseModel):
    mes: str
    dias_treinados: List[int]
    total_treinos_mes: int
    total_treinos: int
    planejados_ate_hoje: int
    consistencia: int
    sequencia: int
    treinou_hoje: bool
