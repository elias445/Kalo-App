from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    objetivo: Optional[str] = None
    nivel_experiencia: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioResponse(UsuarioBase):
    id: str

    class Config:
        from_attributes = True