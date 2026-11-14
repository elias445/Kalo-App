from typing import List, Optional
from pydantic import BaseModel


# Formato de um exercício do catálogo
class ExercicioBusca(BaseModel):
    id: str
    wger_id: int
    nome: str
    nome_en: Optional[str] = None
    idioma: str
    categoria: str
    grupo: str
    musculos: List[str] = []
    musculos_secundarios: List[str] = []
    equipamento: List[str] = []
    descricao: Optional[str] = None
    imagem_url: Optional[str] = None


# Resposta da busca de exercícios
class BuscaExerciciosResponse(BaseModel):
    resultados: List[ExercicioBusca]
    grupos: List[str] = []
