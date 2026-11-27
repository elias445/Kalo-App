from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.exercicio import ExercicioModel
from app.models.treino_planejado import TreinoPlanejado
from app.schemas.treino_planejado import TreinoPlanejadoCreate
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.listar_plano_treino import montar_treino_planejado


# Adiciona um exercício do catálogo a um dia do plano do usuário
def adicionar_exercicio_plano(db: Session, usuario_id, dados: TreinoPlanejadoCreate):
    exigir_usuario(db, usuario_id)
    exercicio = db.query(ExercicioModel).filter(ExercicioModel.id == dados.exercicio_id).first()
    if not exercicio:
        raise HTTPException(status_code=404, detail="Exercício não encontrado no catálogo")

    ja_no_dia = (
        db.query(TreinoPlanejado)
        .filter(
            TreinoPlanejado.usuario_id == usuario_id,
            TreinoPlanejado.dia_semana == dados.dia_semana,
            TreinoPlanejado.exercicio_id == exercicio.id,
        )
        .first()
    )
    if ja_no_dia:
        raise HTTPException(status_code=409, detail="Este exercício já está neste dia")

    ultima_ordem = (
        db.query(func.max(TreinoPlanejado.ordem))
        .filter(TreinoPlanejado.usuario_id == usuario_id, TreinoPlanejado.dia_semana == dados.dia_semana)
        .scalar()
    )

    treino = TreinoPlanejado(
        usuario_id=usuario_id,
        exercicio_id=exercicio.id,
        dia_semana=dados.dia_semana,
        grupo_muscular=exercicio.grupo,
        nome_exercicio=exercicio.nome,
        wger_exercicio_id=exercicio.wger_id,
        series_planejadas=dados.series_planejadas,
        repeticoes=dados.repeticoes,
        carga_kg=dados.carga_kg,
        ordem=(ultima_ordem or 0) + 1,
    )
    db.add(treino)
    db.commit()
    db.refresh(treino)
    return montar_treino_planejado(treino)
