from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.alimento import BuscaAlimentosResponse
from app.use_cases.buscar_alimentos import buscar_na_taco, buscar_industrializados

# Agrupa as rotas sob /alimentos
router = APIRouter(prefix="/alimentos", tags=["Alimentos"])


# GET /alimentos/buscar: pesquisa na TACO e no Open Food Facts
@router.get("/buscar", response_model=BuscaAlimentosResponse)
def buscar_alimentos(
    q: str = Query(..., min_length=2, description="Nome do alimento (ex.: arroz, achocolatado)"),
    fonte: Literal["todos", "taco", "industrializados"] = "todos",
    limite: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    resultados = []
    avisos = []

    # Busca na TACO (nosso banco)
    if fonte in ("todos", "taco"):
        resultados += buscar_na_taco(db, q, limite)

    # Busca em industrializados e se a API falhar, devolve só um aviso
    if fonte in ("todos", "industrializados"):
        try:
            resultados += buscar_industrializados(q, limite)
        except Exception:
            avisos.append("A busca de produtos industrializados está indisponível no momento.")

    return BuscaAlimentosResponse(resultados=resultados, avisos=avisos)
