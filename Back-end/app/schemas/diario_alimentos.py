from pydantic import BaseModel, UUID4
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
    usuario_id: UUID4

class DiarioAlimentosResponse(DiarioAlimentosBase):
    id: UUID4
    usuario_id: UUID4

    class Config:
        from_attributes = True