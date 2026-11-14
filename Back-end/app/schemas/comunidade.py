from datetime import date
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, UUID4, model_validator
from app.schemas.usuario import normalizar_usuario


# Convite de amizade: por @usuario ou por código de convite (um dos dois)
class ConviteAmizade(BaseModel):
    usuario: Optional[str] = Field(None, max_length=40)
    codigo: Optional[str] = Field(None, max_length=20)

    @model_validator(mode="after")
    def um_dos_dois(self):
        if self.usuario is not None:
            self.usuario = normalizar_usuario(self.usuario) or None
        if self.codigo is not None:
            self.codigo = self.codigo.strip().upper() or None
        if bool(self.usuario) == bool(self.codigo):
            raise ValueError("Informe o @usuário ou o código de convite")
        return self


# Dados para criar um desafio entre amigos
class DesafioCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=60)
    duracao_dias: Literal[7, 14, 30, 60]
    convidados: List[UUID4] = Field(..., min_length=1, max_length=20)
    # Data de hoje no celular, que vira o primeiro dia do desafio
    hoje: Optional[date] = None
