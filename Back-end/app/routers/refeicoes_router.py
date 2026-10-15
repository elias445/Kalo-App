from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.diario_alimentos import DiarioAlimentosModel
from pydantic import UUID4
from app.schemas.diario_alimentos import DiarioAlimentosCreate, DiarioAlimentosResponse
from app.use_cases.registrar_refeicao import registrar_refeicao
from app.security import obter_usuario_logado

router = APIRouter(prefix="/refeicoes", tags=["Diário de Refeições"])

@router.get("/usuario/{usuario_id}")
def listar_refeicoes_usuario(
    usuario_id: UUID4, 
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado) 
):
    
    if str(usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado ao diário de outro usuário")

    refeicoes = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.usuario_id == usuario_id).all()
    return refeicoes


@router.post("/", response_model=DiarioAlimentosResponse)
def adicionar_refeicao(
    refeicao: DiarioAlimentosCreate, 
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado)
):
    if str(refeicao.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado. Você não pode adicionar itens para outro usuário.")

    return registrar_refeicao(db=db, refeicao=refeicao)


@router.delete("/{refeicao_id}")
def deletar_refeicao(
    refeicao_id: UUID4, 
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado)
):
    refeicao = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.id == refeicao_id).first()
    
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")
        

    if str(refeicao.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Você não pode deletar uma refeição de outro usuário")
        
    db.delete(refeicao)
    db.commit()
    return {"status": "Refeição deletada com sucesso!"}