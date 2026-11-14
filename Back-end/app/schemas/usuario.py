from pydantic import BaseModel, EmailStr, Field, UUID4, field_validator
from typing import List, Literal, Optional
from app.schemas.treino_planejado import DiaSemana

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

# Dados recebidos ao editar o perfil (nível e dias são opcionais: se faltarem, ficam como estão)
class UsuarioPerfilUpdate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    sexo: str
    idade: int = Field(..., ge=10, le=100)
    altura: float = Field(..., ge=100, le=250)
    objetivo: str
    nivel_experiencia: Optional[Literal["Iniciante", "Intermediário", "Avançado"]] = None
    dias_semana: Optional[List[DiaSemana]] = Field(None, min_length=2, max_length=6)

    @field_validator("dias_semana")
    @classmethod
    def sem_dias_repetidos(cls, dias):
        if dias is not None and len(set(dias)) != len(dias):
            raise ValueError("Há dias repetidos")
        return dias


# Dados biométricos recebidos no onboarding
class UsuarioOnboarding(BaseModel):
    sexo: str
    idade: int
    altura: float
    peso_atual: float
    objetivo: str
    nivel_experiencia: Literal["Iniciante", "Intermediário", "Avançado"] = "Iniciante"
    dias_treino: int = Field(4, ge=2, le=6)
    dias_semana: Optional[List[DiaSemana]] = Field(None, min_length=2, max_length=6)

    @field_validator("dias_semana")
    @classmethod
    def sem_dias_repetidos(cls, dias):
        if dias is not None and len(set(dias)) != len(dias):
            raise ValueError("Há dias repetidos")
        return dias