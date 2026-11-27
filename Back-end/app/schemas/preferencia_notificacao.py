from pydantic import BaseModel, UUID4


# Campos compartilhados entre leitura e atualização
class PreferenciaNotificacaoBase(BaseModel):
    cafe_ativo: bool = True
    cafe_hora: int = 8
    cafe_minuto: int = 0

    lanche_manha_ativo: bool = True
    lanche_manha_hora: int = 10
    lanche_manha_minuto: int = 30

    almoco_ativo: bool = True
    almoco_hora: int = 12
    almoco_minuto: int = 30

    lanche_tarde_ativo: bool = True
    lanche_tarde_hora: int = 16
    lanche_tarde_minuto: int = 0

    jantar_ativo: bool = True
    jantar_hora: int = 19
    jantar_minuto: int = 30

    ceia_ativo: bool = True
    ceia_hora: int = 22
    ceia_minuto: int = 0


# Payload para criar ou atualizar as preferências
class PreferenciaNotificacaoUpsert(PreferenciaNotificacaoBase):
    usuario_id: UUID4


# Resposta serializada com o id do registro
class PreferenciaNotificacaoResponse(PreferenciaNotificacaoBase):
    id: UUID4
    usuario_id: UUID4

    class Config:
        from_attributes = True
