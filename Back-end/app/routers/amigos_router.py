import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.comunidade import ConviteAmizade
from app.security import obter_usuario_logado
from app.use_cases.buscar_usuarios import buscar_usuarios
from app.use_cases.convidar_amigo import convidar_amigo
from app.use_cases.listar_amigos import listar_amigos
from app.use_cases.remover_amizade import remover_amizade
from app.use_cases.responder_convite_amizade import responder_convite_amizade

# Agrupa as rotas sob /amigos (o usuário vem sempre do token)
router = APIRouter(prefix="/amigos", tags=["Amigos"])


# GET /amigos/: amigos, convites recebidos e convites enviados
@router.get("/")
def meus_amigos(
    hoje: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return listar_amigos(db=db, usuario_id=uuid.UUID(usuario_id_logado), hoje=hoje)


# GET /amigos/buscar?q=: procura pessoas pelo começo do @usuario
@router.get("/buscar")
def buscar_pessoas(
    q: str,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return buscar_usuarios(db=db, usuario_id=uuid.UUID(usuario_id_logado), texto=q)


# POST /amigos/convidar: convida por @usuario ou código de convite
@router.post("/convidar")
def convidar(
    dados: ConviteAmizade,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return convidar_amigo(db=db, usuario_id=uuid.UUID(usuario_id_logado), dados=dados)


# POST /amigos/{id}/aceitar: aceita um convite recebido
@router.post("/{amizade_id}/aceitar")
def aceitar(
    amizade_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return responder_convite_amizade(db=db, usuario_id=uuid.UUID(usuario_id_logado), amizade_id=amizade_id, aceitar=True)


# POST /amigos/{id}/recusar: recusa um convite recebido
@router.post("/{amizade_id}/recusar")
def recusar(
    amizade_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return responder_convite_amizade(db=db, usuario_id=uuid.UUID(usuario_id_logado), amizade_id=amizade_id, aceitar=False)


# DELETE /amigos/{id}: desfaz a amizade ou cancela um convite enviado
@router.delete("/{amizade_id}")
def remover(
    amizade_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    remover_amizade(db=db, usuario_id=uuid.UUID(usuario_id_logado), amizade_id=amizade_id)
    return {"status": "Amizade removida"}
