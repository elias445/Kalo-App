from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.historico_medidas import HistoricoMedidasCreate, HistoricoMedidasResponse
from app.use_cases.cadastrar_medida import cadastrar_medida

router = APIRouter(prefix="/medidas", tags=["Histórico de Medidas"])

@router.post("/", response_model=HistoricoMedidasResponse)
def registrar_nova_medida(medida: HistoricoMedidasCreate, db: Session = Depends(get_db)):
    return cadastrar_medida(db=db, medida=medida)