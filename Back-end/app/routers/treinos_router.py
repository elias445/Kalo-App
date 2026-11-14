import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sessao_treino import FrequenciaResponse, SessaoTreinoCreate, SessaoTreinoResponse
from app.schemas.treino_planejado import TreinoPlanejadoCreate, TreinoPlanejadoResponse, TreinoPlanejadoUpdate
from app.security import obter_usuario_logado
from app.use_cases.adicionar_exercicio_plano import adicionar_exercicio_plano
from app.use_cases.atualizar_exercicio_plano import atualizar_exercicio_plano
from app.use_cases.consultar_frequencia import consultar_frequencia
from app.use_cases.gerar_plano_treino import gerar_plano_treino
from app.use_cases.listar_plano_treino import listar_plano_treino
from app.use_cases.registrar_treino_concluido import registrar_treino_concluido
from app.use_cases.remover_exercicio_plano import remover_exercicio_plano

# Agrupa as rotas sob /treinos (o usuário vem sempre do token)
router = APIRouter(prefix="/treinos", tags=["Plano de Treino"])


# GET /treinos/: plano de treino do usuário logado
@router.get("/", response_model=List[TreinoPlanejadoResponse])
def listar_meu_plano(db: Session = Depends(get_db), usuario_id_logado: str = Depends(obter_usuario_logado)):
    return listar_plano_treino(db=db, usuario_id=uuid.UUID(usuario_id_logado))


# POST /treinos/: adiciona um exercício a um dia do plano
@router.post("/", response_model=TreinoPlanejadoResponse)
def adicionar_ao_plano(
    dados: TreinoPlanejadoCreate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return adicionar_exercicio_plano(db=db, usuario_id=uuid.UUID(usuario_id_logado), dados=dados)


# POST /treinos/gerar: gera o plano pelo objetivo, nível e dias por semana (substituir=true refaz o plano atual)
@router.post("/gerar", response_model=List[TreinoPlanejadoResponse])
def gerar_meu_plano(
    substituir: bool = False,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return gerar_plano_treino(db=db, usuario_id=uuid.UUID(usuario_id_logado), substituir=substituir)


# POST /treinos/concluir: registra o treino do dia como concluído
@router.post("/concluir", response_model=SessaoTreinoResponse)
def concluir_treino(
    dados: SessaoTreinoCreate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return registrar_treino_concluido(db=db, usuario_id=uuid.UUID(usuario_id_logado), dados=dados)


# GET /treinos/frequencia: calendário, consistência e sequência de treino do mês
@router.get("/frequencia", response_model=FrequenciaResponse)
def frequencia_de_treino(
    mes: str = Query(..., description="Mês no formato AAAA-MM"),
    hoje: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return consultar_frequencia(db=db, usuario_id=uuid.UUID(usuario_id_logado), mes=mes, hoje=hoje)


# PUT /treinos/{id}: troca o exercício ou altera séries, repetições e carga
@router.put("/{treino_id}", response_model=TreinoPlanejadoResponse)
def alterar_plano(
    treino_id: UUID4,
    dados: TreinoPlanejadoUpdate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return atualizar_exercicio_plano(db=db, usuario_id=uuid.UUID(usuario_id_logado), treino_id=treino_id, dados=dados)


# DELETE /treinos/{id}: remove um exercício do plano
@router.delete("/{treino_id}")
def remover_do_plano(
    treino_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    remover_exercicio_plano(db=db, usuario_id=uuid.UUID(usuario_id_logado), treino_id=treino_id)
    return {"status": "Exercício removido do plano"}
