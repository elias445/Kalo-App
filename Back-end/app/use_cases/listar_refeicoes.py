from typing import List
from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel


# Todos os alimentos registrados pelo usuário
def listar_refeicoes(db: Session, usuario_id) -> List[DiarioAlimentosModel]:
    return db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.usuario_id == usuario_id).all()
