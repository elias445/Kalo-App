from typing import List
from sqlalchemy.orm import Session
from app.models.historico_medidas import HistoricoMedidasModel


# Histórico de peso do usuário, do mais antigo ao mais novo
def listar_medidas(db: Session, usuario_id) -> List[HistoricoMedidasModel]:
    return (
        db.query(HistoricoMedidasModel)
        .filter(HistoricoMedidasModel.usuario_id == usuario_id)
        .order_by(HistoricoMedidasModel.data_registro)
        .all()
    )
