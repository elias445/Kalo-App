from typing import List
from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel


def listar_refeicoes(db: Session, usuario_id) -> List[DiarioAlimentosModel]:
    return db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.usuario_id == usuario_id).all()
