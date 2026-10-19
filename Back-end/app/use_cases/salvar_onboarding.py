from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioOnboarding


def salvar_onboarding(db: Session, usuario_id: str, dados: UsuarioOnboarding) -> UsuarioModel:
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.sexo = dados.sexo
    usuario.idade = dados.idade
    usuario.altura = dados.altura
    usuario.peso_atual = dados.peso_atual
    usuario.objetivo = dados.objetivo

    db.commit()
    db.refresh(usuario)
    return usuario
