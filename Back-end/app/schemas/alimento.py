from typing import Dict, List, Optional
from pydantic import BaseModel


# Formato de um alimento na busca (TACO ou Open Food Facts)
class AlimentoBusca(BaseModel):
    id: str
    nome: str
    categoria: Optional[str] = None
    fonte: str
    kcal_100g: float
    proteina_100g: float
    carboidrato_100g: float
    gordura_100g: float
    fibra_100g: float = 0
    nutrientes: Dict[str, float] = {}
    porcao_g: Optional[float] = None
    porcao_descricao: Optional[str] = None
    embalagem_g: Optional[float] = None


# Resposta da busca: lista de alimentos e avisos
class BuscaAlimentosResponse(BaseModel):
    resultados: List[AlimentoBusca]
    avisos: List[str] = []
