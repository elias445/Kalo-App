from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.amizade import Amizade
from app.use_cases.exigir_usuario import exigir_usuario


# Aceita ou recusa um convite de amizade recebido (só quem recebeu pode responder)
def responder_convite_amizade(db: Session, usuario_id, amizade_id, aceitar: bool) -> dict:
    exigir_usuario(db, usuario_id)
    amizade = db.get(Amizade, amizade_id)
    if amizade is None:
        raise HTTPException(status_code=404, detail="Convite não encontrado.")
    if amizade.destinatario_id != usuario_id:
        raise HTTPException(status_code=403, detail="Esse convite não é seu.")
    if amizade.status != "pendente":
        raise HTTPException(status_code=409, detail="Esse convite já foi respondido.")

    if aceitar:
        amizade.status = "aceita"
    else:
        db.delete(amizade)
    db.commit()
    return {"status": "aceita" if aceitar else "recusada"}
