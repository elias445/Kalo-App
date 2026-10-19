from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.historico_medidas import HistoricoMedidasCreate, HistoricoMedidasResponse
from app.security import obter_usuario_logado
from app.use_cases.cadastrar_medida import cadastrar_medida
from app.use_cases.listar_medidas import listar_medidas

router = APIRouter(prefix="/medidas", tags=["Histórico de Medidas"])


@router.post("/", response_model=HistoricoMedidasResponse)
def registrar_nova_medida(
    medida: HistoricoMedidasCreate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(medida.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado. Você não pode registrar medidas de outro usuário.")

    return cadastrar_medida(db=db, medida=medida)


@router.get("/usuario/{usuario_id}", response_model=List[HistoricoMedidasResponse])
def listar_medidas_usuario(
    usuario_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado ao histórico de outro usuário.")

    return listar_medidas(db=db, usuario_id=usuario_id)
