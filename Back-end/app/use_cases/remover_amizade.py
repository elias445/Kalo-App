from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.amizade import Amizade
from app.use_cases.exigir_usuario import exigir_usuario


# Desfaz a amizade ou cancela um convite enviado (qualquer um dos dois pode)
def remover_amizade(db: Session, usuario_id, amizade_id) -> None:
    exigir_usuario(db, usuario_id)
    amizade = db.get(Amizade, amizade_id)
    if amizade is None:
        raise HTTPException(status_code=404, detail="Amizade não encontrada.")
    if usuario_id not in (amizade.solicitante_id, amizade.destinatario_id):
        raise HTTPException(status_code=403, detail="Essa amizade não é sua.")
    db.delete(amizade)
    db.commit()
