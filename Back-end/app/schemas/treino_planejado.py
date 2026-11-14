from typing import List, Literal, Optional
from pydantic import BaseModel, Field, UUID4

DiaSemana = Literal["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]


# Dados recebidos ao adicionar um exercício ao plano (o usuário vem do token)
class TreinoPlanejadoCreate(BaseModel):
    dia_semana: DiaSemana
    exercicio_id: UUID4
    series_planejadas: int = Field(3, ge=1, le=10)
    repeticoes: int = Field(12, ge=1, le=100)
    carga_kg: float = Field(0, ge=0, le=1000)


# Dados recebidos ao alterar um exercício do plano (troca o exercício e/ou muda os números)
class TreinoPlanejadoUpdate(BaseModel):
    exercicio_id: Optional[UUID4] = None
    series_planejadas: Optional[int] = Field(None, ge=1, le=10)
    repeticoes: Optional[int] = Field(None, ge=1, le=100)
    carga_kg: Optional[float] = Field(None, ge=0, le=1000)


# Dados do exercício do catálogo que acompanham cada item do plano
class ExercicioDoTreino(BaseModel):
    id: str
    wger_id: int
    nome: str
    grupo: str
    idioma: str = "pt"
    musculos: List[str] = []
    musculos_secundarios: List[str] = []
    equipamento: List[str] = []
    descricao: Optional[str] = None
    imagem_url: Optional[str] = None


# Dados devolvidos ao app
class TreinoPlanejadoResponse(BaseModel):
    id: UUID4
    dia_semana: str
    ordem: int
    series_planejadas: int
    repeticoes: int
    carga_kg: float
    grupo_muscular: str
    nome_exercicio: str
    exercicio: Optional[ExercicioDoTreino] = None
