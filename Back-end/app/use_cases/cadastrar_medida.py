from sqlalchemy.orm import Session
from app.models.historico_medidas import HistoricoMedidasModel
from app.models.usuario import UsuarioModel
from app.schemas.historico_medidas import HistoricoMedidasCreate

def cadastrar_medida(db: Session, medida: HistoricoMedidasCreate):
    db_medida = HistoricoMedidasModel(**medida.model_dump())
    db.add(db_medida)

    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == medida.usuario_id).first()
    if usuario:
        usuario.peso_atual = medida.peso_kg

    db.commit()
    db.refresh(db_medida)
    return db_medida
