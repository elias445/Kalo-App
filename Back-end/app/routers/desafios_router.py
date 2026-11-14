import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.comunidade import DesafioCreate
from app.security import obter_usuario_logado
from app.use_cases.criar_desafio import criar_desafio
from app.use_cases.listar_desafios import listar_desafios
from app.use_cases.ranking_desafio import consultar_ranking_desafio
from app.use_cases.responder_convite_desafio import responder_convite_desafio

# Agrupa as rotas sob /desafios (o usuário vem sempre do token)
router = APIRouter(prefix="/desafios", tags=["Desafios"])


# GET /desafios/: desafios do usuário (com posição e pontos) e convites pendentes
@router.get("/")
def meus_desafios(
    hoje: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return listar_desafios(db=db, usuario_id=uuid.UUID(usuario_id_logado), hoje=hoje)


# POST /desafios/: cria um desafio e convida amigos
@router.post("/")
def criar(
    dados: DesafioCreate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return criar_desafio(db=db, usuario_id=uuid.UUID(usuario_id_logado), dados=dados)


# GET /desafios/{id}/ranking: ranking dos participantes
@router.get("/{desafio_id}/ranking")
def ranking(
    desafio_id: UUID4,
    hoje: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return consultar_ranking_desafio(db=db, usuario_id=uuid.UUID(usuario_id_logado), desafio_id=desafio_id, hoje=hoje)


# POST /desafios/{id}/aceitar: aceita o convite
@router.post("/{desafio_id}/aceitar")
def aceitar(
    desafio_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return responder_convite_desafio(db=db, usuario_id=uuid.UUID(usuario_id_logado), desafio_id=desafio_id, aceitar=True)


# POST /desafios/{id}/recusar: recusa o convite (ou sai do desafio)
@router.post("/{desafio_id}/recusar")
def recusar(
    desafio_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return responder_convite_desafio(db=db, usuario_id=uuid.UUID(usuario_id_logado), desafio_id=desafio_id, aceitar=False)
