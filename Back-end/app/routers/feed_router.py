import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.security import obter_usuario_logado
from app.use_cases.curtir_atividade import curtir_atividade
from app.use_cases.listar_feed import listar_feed

# Agrupa as rotas sob /feed (o usuário vem sempre do token)
router = APIRouter(prefix="/feed", tags=["Feed"])


# GET /feed/: atividades do usuário e dos amigos, de 20 em 20 (antes = horário da última já carregada)
@router.get("/")
def meu_feed(
    limite: int = Query(20, ge=1, le=50),
    antes: Optional[datetime] = None,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return listar_feed(db=db, usuario_id=uuid.UUID(usuario_id_logado), limite=limite, antes=antes)


# POST /feed/{id}/curtir: curte ou descurte uma atividade
@router.post("/{atividade_id}/curtir")
def curtir(
    atividade_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return curtir_atividade(db=db, usuario_id=uuid.UUID(usuario_id_logado), atividade_id=atividade_id)
