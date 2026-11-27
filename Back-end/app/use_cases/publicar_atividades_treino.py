from sqlalchemy.orm import Session
from app.models.atividade import Atividade
from app.models.sessao_treino import SessaoTreino
from app.models.treino_planejado import TreinoPlanejado
from app.use_cases.estatisticas_treino import calcular_sequencia, datas_treinadas, dias_planejados

# Tamanhos de sequência que viram uma atividade no feed
MARCOS_DE_SEQUENCIA = {3, 5, 7, 10, 14, 21, 30, 50, 100}


# Nome do treino do dia pelos grupos musculares (ex.: "Peito & Tríceps"), como aparece no app
def _titulo_do_dia(db: Session, usuario_id, dia_semana: str) -> str:
    itens = (
        db.query(TreinoPlanejado.grupo_muscular)
        .filter(TreinoPlanejado.usuario_id == usuario_id, TreinoPlanejado.dia_semana == dia_semana)
        .order_by(TreinoPlanejado.ordem)
        .all()
    )
    grupos = list(dict.fromkeys(linha[0] for linha in itens))[:2]
    return " & ".join(grupos) if grupos else "Treino"


# Publica no feed o treino concluído e, se bateu um marco, a sequência de dias seguidos
def publicar_atividades_treino(db: Session, usuario_id, sessao: SessaoTreino) -> None:
    titulo = _titulo_do_dia(db, usuario_id, sessao.dia_semana)
    quantidade = sessao.exercicios_concluidos
    db.add(Atividade(
        usuario_id=usuario_id,
        tipo="treino",
        acao="concluiu o treino",
        detalhe=f"{titulo}  •  {quantidade} {'exercício' if quantidade == 1 else 'exercícios'}",
    ))

    treinadas = datas_treinadas(db, usuario_id, ate=sessao.data_treino)
    sequencia = calcular_sequencia(treinadas, dias_planejados(db, usuario_id), sessao.data_treino)
    if sequencia in MARCOS_DE_SEQUENCIA:
        db.add(Atividade(
            usuario_id=usuario_id,
            tipo="sequencia",
            acao=f"chegou a {sequencia} treinos seguidos",
            detalhe="Sequência de treinos",
        ))
    db.commit()
