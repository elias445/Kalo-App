from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.diario_alimentos import DiarioAlimentosModel
from pydantic import UUID4
from fastapi import HTTPException
from app.schemas.diario_alimentos import DiarioAlimentosCreate, DiarioAlimentosResponse
from app.use_cases.registrar_refeicao import registrar_refeicao

router = APIRouter(prefix="/refeicoes", tags=["Diário de Refeições"])


@router.get("/usuario/{usuario_id}")
def listar_refeicoes_usuario(usuario_id: UUID4, db: Session = Depends(get_db)):
    refeicoes = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.usuario_id == usuario_id).all()
    return refeicoes

@router.post("/", response_model=DiarioAlimentosResponse)
def adicionar_refeicao(refeicao: DiarioAlimentosCreate, db: Session = Depends(get_db)):
    return registrar_refeicao(db=db, refeicao=refeicao)

@router.delete("/{refeicao_id}")
def deletar_refeicao(refeicao_id: UUID4, db: Session = Depends(get_db)):
    refeicao = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.id == refeicao_id).first()
    
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")
        
    db.delete(refeicao)
    db.commit()
    return {"status": "Refeição deletada com sucesso!"}