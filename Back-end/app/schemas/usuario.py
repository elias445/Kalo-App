import re
from pydantic import BaseModel, EmailStr, Field, UUID4, field_validator
from typing import List, Literal, Optional
from app.schemas.treino_planejado import DiaSemana

# @usuario: de 3 a 20 caracteres (letras minúsculas, números, ponto e sublinhado), começando por letra ou número
PADRAO_USUARIO = re.compile(r"^[a-z0-9][a-z0-9._]{2,19}$")


# Tira o @ e os espaços e deixa em minúsculas (ex.: " @Joao.Vitor " vira "joao.vitor")
def normalizar_usuario(texto: str) -> str:
    return texto.strip().lstrip("@").strip().lower()


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    objetivo: Optional[str] = None
    nivel_experiencia: Optional[str] = None


# Dados recebidos no cadastro
class UsuarioCreate(UsuarioBase):
    senha: str
    usuario: str

    @field_validator("usuario")
    @classmethod
    def usuario_valido(cls, valor):
        limpo = normalizar_usuario(valor)
        if not PADRAO_USUARIO.match(limpo):
            raise ValueError("Use de 3 a 20 caracteres: letras, números, ponto ou sublinhado")
        return limpo


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


# Dados recebidos ao renovar o token de acesso
class UsuarioRefresh(BaseModel):
    refresh_token: str

# Resposta com novos tokens
class TokenResponse(BaseModel):
    token: str
    refresh_token: str

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