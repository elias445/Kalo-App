from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel
from app.schemas.diario_alimentos import DiarioAlimentosCreate

def registrar_refeicao(db: Session, refeicao: DiarioAlimentosCreate):
    db_refeicao = DiarioAlimentosModel(**refeicao.model_dump())
    
    db.add(db_refeicao)
    db.commit()
    db.refresh(db_refeicao)
    return db_refeicao