from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel


# Lista os alimentos registrados pelo usuário, filtrado por data quando fornecida
def listar_refeicoes(db: Session, usuario_id, data: Optional[date] = None) -> List[DiarioAlimentosModel]:
    query = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.usuario_id == usuario_id)
    if data is not None:
        query = query.filter(DiarioAlimentosModel.data_consumo == data)
    return query.all()
