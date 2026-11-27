from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioPerfilUpdate
from app.use_cases.gerar_plano_treino import gerar_plano_treino
from app.use_cases.salvar_onboarding import SEMANA
from app.use_cases.sessao import dados_do_usuario


# Atualiza os dados do perfil e, se o objetivo, o nível ou os dias de treino mudaram, refaz o plano de treino
def editar_perfil(db: Session, usuario_id, dados: UsuarioPerfilUpdate) -> dict:
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    mudou_plano = dados.objetivo != usuario.objetivo

    usuario.nome = dados.nome.strip()
    usuario.sexo = dados.sexo
    usuario.idade = dados.idade
    usuario.altura = dados.altura
    usuario.objetivo = dados.objetivo

    if dados.nivel_experiencia is not None:
        mudou_plano = mudou_plano or dados.nivel_experiencia != usuario.nivel_experiencia
        usuario.nivel_experiencia = dados.nivel_experiencia

    if dados.dias_semana:
        dias = ",".join(sorted(dados.dias_semana, key=SEMANA.index))
        mudou_plano = mudou_plano or dias != usuario.dias_preferidos
        usuario.dias_preferidos = dias
        usuario.dias_treino = len(dados.dias_semana)

    db.commit()
    db.refresh(usuario)

    if mudou_plano:
        gerar_plano_treino(db, usuario.id, substituir=True)

    return {**dados_do_usuario(usuario), "plano_refeito": mudou_plano}
