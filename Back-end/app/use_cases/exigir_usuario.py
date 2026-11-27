from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel


# Garante que o usuário do token ainda existe (erro 401 se a conta foi removida)
def exigir_usuario(db: Session, usuario_id) -> None:
    if db.query(UsuarioModel.id).filter(UsuarioModel.id == usuario_id).first() is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado. Faça login novamente.")
