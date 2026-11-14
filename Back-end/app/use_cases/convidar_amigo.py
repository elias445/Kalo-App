from fastapi import HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from app.models.amizade import Amizade
from app.models.usuario import UsuarioModel
from app.schemas.comunidade import ConviteAmizade
from app.use_cases.exigir_usuario import exigir_usuario


# Envia um convite de amizade por @usuario ou código de convite (se a outra pessoa já tinha convidado, vira amizade)
def convidar_amigo(db: Session, usuario_id, dados: ConviteAmizade) -> dict:
    exigir_usuario(db, usuario_id)

    if dados.usuario:
        alvo = db.query(UsuarioModel).filter(UsuarioModel.usuario == dados.usuario).first()
    else:
        alvo = db.query(UsuarioModel).filter(UsuarioModel.codigo_convite == dados.codigo).first()
    if alvo is None:
        raise HTTPException(status_code=404, detail="Não encontramos ninguém com esse @usuário ou código.")
    if alvo.id == usuario_id:
        raise HTTPException(status_code=422, detail="Você não pode adicionar a si mesmo.")

    existente = (
        db.query(Amizade)
        .filter(
            or_(
                and_(Amizade.solicitante_id == usuario_id, Amizade.destinatario_id == alvo.id),
                and_(Amizade.solicitante_id == alvo.id, Amizade.destinatario_id == usuario_id),
            )
        )
        .first()
    )
    if existente:
        if existente.status == "aceita":
            raise HTTPException(status_code=409, detail="Vocês já são amigos.")
        if existente.solicitante_id == usuario_id:
            raise HTTPException(status_code=409, detail="Você já enviou um convite para essa pessoa.")
        # A outra pessoa já tinha convidado: aceitar o convite dela
        existente.status = "aceita"
        db.commit()
        return {"id": existente.id, "status": "aceita", "nome": alvo.nome, "usuario": alvo.usuario}

    amizade = Amizade(solicitante_id=usuario_id, destinatario_id=alvo.id, status="pendente")
    db.add(amizade)
    db.commit()
    db.refresh(amizade)
    return {"id": amizade.id, "status": "pendente", "nome": alvo.nome, "usuario": alvo.usuario}
