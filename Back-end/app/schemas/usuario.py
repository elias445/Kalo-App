from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    objetivo: Optional[str] = None
    nivel_experiencia: Optional[str] = None


# Dados recebidos no cadastro
class UsuarioCreate(UsuarioBase):
    senha: str


# Dados do usuário devolvidos ao app
class UsuarioResponse(UsuarioBase):
    id: UUID4

    class Config:
        from_attributes = True

# Dados recebidos no login
class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

# Dados biométricos recebidos no onboarding
class UsuarioOnboarding(BaseModel):
    sexo: str
    idade: int
    altura: float
    peso_atual: float
    objetivo: str