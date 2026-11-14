from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.desafio import Desafio, DesafioParticipante
from app.use_cases.exigir_usuario import exigir_usuario


# Aceita ou recusa o convite de um desafio; quem já aceitou pode sair, menos o criador
def responder_convite_desafio(db: Session, usuario_id, desafio_id, aceitar: bool) -> dict:
    exigir_usuario(db, usuario_id)
    participacao = (
        db.query(DesafioParticipante)
        .filter(DesafioParticipante.desafio_id == desafio_id, DesafioParticipante.usuario_id == usuario_id)
        .first()
    )
    if participacao is None:
        raise HTTPException(status_code=404, detail="Você não foi convidado para esse desafio.")

    if aceitar:
        if participacao.status == "aceito":
            raise HTTPException(status_code=409, detail="Você já participa desse desafio.")
        participacao.status = "aceito"
        db.commit()
        return {"status": "aceito"}

    desafio = db.get(Desafio, desafio_id)
    if desafio.criador_id == usuario_id:
        raise HTTPException(status_code=422, detail="O criador não pode sair do próprio desafio.")
    db.delete(participacao)
    db.commit()
    return {"status": "recusado"}
