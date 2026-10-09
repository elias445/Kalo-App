from pydantic import BaseModel
from datetime import date

class DiarioAlimentosBase(BaseModel):
    data_consumo: date
    tipo_refeicao: str
    nome_alimento: str
    quantidade_gramas: float
    calorias: float
    carboidratos: float
    proteinas: float
    gorduras: float

class DiarioAlimentosCreate(DiarioAlimentosBase):
    usuario_id: str

class DiarioAlimentosResponse(DiarioAlimentosBase):
    id: str
    usuario_id: str

    class Config:
        from_attributes = True