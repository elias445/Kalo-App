from typing import List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.exercicio import ExercicioModel
from app.schemas.exercicio import ExercicioBusca
from app.use_cases.carregar_taco import normalizar


# Converte o model em schema da API
def _para_schema(e: ExercicioModel) -> ExercicioBusca:
    return ExercicioBusca(
        id=str(e.id),
        wger_id=e.wger_id,
        nome=e.nome,
        nome_en=e.nome_en,
        idioma=e.idioma,
        categoria=e.categoria,
        grupo=e.grupo,
        musculos=e.musculos or [],
        musculos_secundarios=e.musculos_secundarios or [],
        equipamento=e.equipamento or [],
        descricao=e.descricao,
        imagem_url=e.imagem_url,
    )


# Busca exercícios por nome e/ou grupo muscular; os que têm nome em português e imagem vêm primeiro
def buscar_exercicios(db: Session, termo: Optional[str], grupo: Optional[str], limite: int) -> List[ExercicioBusca]:
    consulta = db.query(ExercicioModel)

    if grupo:
        consulta = consulta.filter(ExercicioModel.grupo == grupo)

    for palavra in normalizar(termo or "").split():
        consulta = consulta.filter(
            or_(
                ExercicioModel.nome_busca.contains(palavra),
                func.lower(func.coalesce(ExercicioModel.nome_en, "")).contains(palavra),
            )
        )

    encontrados = (
        consulta.order_by(
            (ExercicioModel.idioma == "pt").desc(),
            (ExercicioModel.imagem_url.isnot(None)).desc(),
            func.length(ExercicioModel.nome),
            ExercicioModel.nome,
        )
        .limit(limite)
        .all()
    )
    return [_para_schema(e) for e in encontrados]


# Lista os grupos musculares disponíveis no catálogo
def listar_grupos(db: Session) -> List[str]:
    linhas = db.query(ExercicioModel.grupo).distinct().order_by(ExercicioModel.grupo).all()
    return [linha[0] for linha in linhas]
