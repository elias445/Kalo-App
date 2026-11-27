from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioOnboarding

# Dias da semana, começando na segunda-feira
SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]


# Salva os dados biométricos no usuário
def salvar_onboarding(db: Session, usuario_id: str, dados: UsuarioOnboarding) -> UsuarioModel:
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.sexo = dados.sexo
    usuario.idade = dados.idade
    usuario.altura = dados.altura
    usuario.peso_atual = dados.peso_atual
    usuario.objetivo = dados.objetivo
    usuario.nivel_experiencia = dados.nivel_experiencia
    if dados.dias_semana:
        usuario.dias_treino = len(dados.dias_semana)
        usuario.dias_preferidos = ",".join(sorted(dados.dias_semana, key=SEMANA.index))
    else:
        usuario.dias_treino = dados.dias_treino
        usuario.dias_preferidos = None

    db.commit()
    db.refresh(usuario)
    return usuario
