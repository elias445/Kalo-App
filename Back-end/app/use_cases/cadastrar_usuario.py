from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioCreate
from app.security import gerar_hash_senha
from app.use_cases.codigo_convite import gerar_codigo_convite


# Cria a conta (e-mail e @usuario únicos, senha com hash e código de convite)
def cadastrar_usuario(db: Session, usuario: UsuarioCreate) -> UsuarioModel:
    if db.query(UsuarioModel).filter(UsuarioModel.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="Este e-mail já está em uso.")
    if db.query(UsuarioModel).filter(UsuarioModel.usuario == usuario.usuario).first():
        raise HTTPException(status_code=400, detail="Este @usuário já está em uso.")

    novo_usuario = UsuarioModel(
        nome=usuario.nome,
        email=usuario.email,
        usuario=usuario.usuario,
        codigo_convite=gerar_codigo_convite(db),
        senha_hash=gerar_hash_senha(usuario.senha),
        objetivo=usuario.objetivo,
        nivel_experiencia=usuario.nivel_experiencia,
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario
