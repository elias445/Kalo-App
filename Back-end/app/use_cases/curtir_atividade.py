from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.atividade import Atividade, Curtida
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.ids_amigos import ids_amigos


# Curte a atividade (ou tira a curtida se já tinha curtido); só vale para atividades do usuário e dos amigos
def curtir_atividade(db: Session, usuario_id, atividade_id) -> dict:
    exigir_usuario(db, usuario_id)
    atividade = db.get(Atividade, atividade_id)
    if atividade is None:
        raise HTTPException(status_code=404, detail="Atividade não encontrada.")
    if atividade.usuario_id != usuario_id and atividade.usuario_id not in ids_amigos(db, usuario_id):
        raise HTTPException(status_code=403, detail="Você só pode curtir atividades dos seus amigos.")

    curtida = db.query(Curtida).filter(Curtida.atividade_id == atividade_id, Curtida.usuario_id == usuario_id).first()
    if curtida:
        db.delete(curtida)
        curtiu = False
    else:
        db.add(Curtida(atividade_id=atividade_id, usuario_id=usuario_id))
        curtiu = True
    db.commit()

    total = db.query(func.count(Curtida.id)).filter(Curtida.atividade_id == atividade_id).scalar()
    return {"curtiu": curtiu, "curtidas": total}
