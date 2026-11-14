from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.amizade import Amizade


# Ids dos usuários que já são amigos (convite aceito) do usuário informado
def ids_amigos(db: Session, usuario_id) -> set:
    amizades = (
        db.query(Amizade)
        .filter(Amizade.status == "aceita", or_(Amizade.solicitante_id == usuario_id, Amizade.destinatario_id == usuario_id))
        .all()
    )
    return {a.destinatario_id if a.solicitante_id == usuario_id else a.solicitante_id for a in amizades}
