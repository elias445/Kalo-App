from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.exercicio import ExercicioModel
from app.models.treino_planejado import TreinoPlanejado
from app.schemas.treino_planejado import TreinoPlanejadoUpdate
from app.use_cases.listar_plano_treino import montar_treino_planejado


# Troca o exercício de um ponto do plano (mantendo a posição) e/ou altera séries, repetições e carga
def atualizar_exercicio_plano(db: Session, usuario_id, treino_id, dados: TreinoPlanejadoUpdate):
    treino = db.query(TreinoPlanejado).filter(TreinoPlanejado.id == treino_id).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Exercício do plano não encontrado")
    if str(treino.usuario_id) != str(usuario_id):
        raise HTTPException(status_code=403, detail="Você não pode alterar o plano de outro usuário")

    if dados.exercicio_id is not None:
        exercicio = db.query(ExercicioModel).filter(ExercicioModel.id == dados.exercicio_id).first()
        if not exercicio:
            raise HTTPException(status_code=404, detail="Exercício não encontrado no catálogo")

        repetido = (
            db.query(TreinoPlanejado)
            .filter(
                TreinoPlanejado.usuario_id == usuario_id,
                TreinoPlanejado.dia_semana == treino.dia_semana,
                TreinoPlanejado.exercicio_id == exercicio.id,
                TreinoPlanejado.id != treino.id,
            )
            .first()
        )
        if repetido:
            raise HTTPException(status_code=409, detail="Este exercício já está neste dia")

        treino.exercicio_id = exercicio.id
        treino.grupo_muscular = exercicio.grupo
        treino.nome_exercicio = exercicio.nome
        treino.wger_exercicio_id = exercicio.wger_id

    if dados.series_planejadas is not None:
        treino.series_planejadas = dados.series_planejadas
    if dados.repeticoes is not None:
        treino.repeticoes = dados.repeticoes
    if dados.carga_kg is not None:
        treino.carga_kg = dados.carga_kg

    db.commit()
    db.refresh(treino)
    return montar_treino_planejado(treino)
