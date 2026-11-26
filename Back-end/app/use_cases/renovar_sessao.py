from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.security import criar_token_acesso, criar_token_refresh, verificar_token_refresh


# Renova o token de acesso usando o refresh token (sessão deslizante)
def renovar_sessao(db: Session, refresh_token: str) -> dict:
    usuario_id = verificar_token_refresh(refresh_token)

    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    payload = {"sub": str(usuario.id)}
    novo_access_token = criar_token_acesso(payload)
    novo_refresh_token = criar_token_refresh(payload)

    return {
        "token": novo_access_token,
        "refresh_token": novo_refresh_token,
    }
