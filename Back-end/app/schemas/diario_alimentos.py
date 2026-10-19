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

# Dados recebidos ao registrar um alimento
class DiarioAlimentosCreate(DiarioAlimentosBase):
    usuario_id: UUID4

# Dados devolvidos ao app
class DiarioAlimentosResponse(DiarioAlimentosBase):
    id: UUID4
    usuario_id: UUID4

    class Config:
        from_attributes = True