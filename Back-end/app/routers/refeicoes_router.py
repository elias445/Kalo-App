from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.diario_alimentos import DiarioAlimentosCreate, DiarioAlimentosResponse
from app.use_cases.registrar_refeicao import registrar_refeicao

router = APIRouter(prefix="/refeicoes", tags=["Diário de Refeições"])

@router.post("/", response_model=DiarioAlimentosResponse)
def adicionar_refeicao(refeicao: DiarioAlimentosCreate, db: Session = Depends(get_db)):
    return registrar_refeicao(db=db, refeicao=refeicao)