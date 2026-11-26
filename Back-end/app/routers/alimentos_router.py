from typing import Literal, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.alimento import BuscaAlimentosResponse
from app.use_cases.buscar_alimentos import buscar_na_taco, buscar_industrializados

# Agrupa as rotas sob /alimentos
router = APIRouter(prefix="/alimentos", tags=["Alimentos"])


# GET /alimentos/buscar: lista TACO paginada (quando q vazio) ou pesquisa na TACO e no Open Food Facts
@router.get("/buscar", response_model=BuscaAlimentosResponse)
def buscar_alimentos(
    q: Optional[str] = Query(None, description="Nome do alimento (ex.: arroz, achocolatado)"),
    fonte: Literal["todos", "taco", "industrializados"] = "todos",
    limite: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    termo = (q or "").strip()
    if termo and len(termo) < 2:
        return BuscaAlimentosResponse(resultados=[], avisos=[], tem_mais=False)

    resultados = []
    avisos = []
    tem_mais = False

    # Busca na TACO (nosso banco) — também usada para listagem inicial paginada
    if fonte in ("todos", "taco"):
        taco_itens, tem_mais_taco = buscar_na_taco(db, termo, limite, offset)
        resultados += taco_itens
        tem_mais = tem_mais or tem_mais_taco

    # Busca em industrializados apenas quando há termo (API externa)
    if termo and (fonte == "industrializados" or (fonte == "todos" and offset == 0)):
        try:
            ind_itens, tem_mais_ind = buscar_industrializados(termo, limite, offset if fonte == "industrializados" else 0)
            resultados += ind_itens
            if fonte == "industrializados":
                tem_mais = tem_mais_ind
        except Exception:
            avisos.append("A busca de produtos industrializados está indisponível no momento.")

    return BuscaAlimentosResponse(resultados=resultados, avisos=avisos, tem_mais=tem_mais)
