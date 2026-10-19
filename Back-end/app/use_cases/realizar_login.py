from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioLogin
from app.security import verificar_senha


def realizar_login(db: Session, dados: UsuarioLogin) -> UsuarioModel:
    usuario = db.query(UsuarioModel).filter(UsuarioModel.email == dados.email).first()
    
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    return usuario
