from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.exercicio import BuscaExerciciosResponse
from app.use_cases.buscar_exercicios import buscar_exercicios, listar_grupos

# Agrupa as rotas sob /exercicios
router = APIRouter(prefix="/exercicios", tags=["Exercícios"])


# GET /exercicios/buscar: pesquisa no catálogo de exercícios (wger)
@router.get("/buscar", response_model=BuscaExerciciosResponse)
def pesquisar_exercicios(
    q: Optional[str] = Query(None, description="Nome do exercício (ex.: supino, agachamento)"),
    grupo: Optional[str] = Query(None, description="Grupo muscular (ex.: Peito, Pernas)"),
    limite: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return BuscaExerciciosResponse(
        resultados=buscar_exercicios(db, q, grupo, limite),
        grupos=listar_grupos(db),
    )
