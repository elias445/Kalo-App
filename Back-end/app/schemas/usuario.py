from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    objetivo: Optional[str] = None
    nivel_experiencia: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioResponse(UsuarioBase):
    id: UUID4

    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str