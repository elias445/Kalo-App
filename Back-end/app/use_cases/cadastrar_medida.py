from sqlalchemy.orm import Session
from app.models.historico_medidas import HistoricoMedidasModel
from app.schemas.historico_medidas import HistoricoMedidasCreate

def cadastrar_medida(db: Session, medida: HistoricoMedidasCreate):
    db_medida = HistoricoMedidasModel(**medida.model_dump())
    
    db.add(db_medida)
    db.commit()
    db.refresh(db_medida)
    return db_medida