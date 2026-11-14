from typing import List
from sqlalchemy.orm import Session
from app.models.treino_planejado import TreinoPlanejado
from app.schemas.treino_planejado import ExercicioDoTreino, TreinoPlanejadoResponse

ORDEM_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]


# Converte um item do plano (com o exercício do catálogo) no formato devolvido ao app
def montar_treino_planejado(treino: TreinoPlanejado) -> TreinoPlanejadoResponse:
    catalogo = treino.exercicio
    return TreinoPlanejadoResponse(
        id=treino.id,
        dia_semana=treino.dia_semana,
        ordem=treino.ordem or 1,
        series_planejadas=treino.series_planejadas,
        repeticoes=treino.repeticoes,
        carga_kg=treino.carga_kg,
        grupo_muscular=treino.grupo_muscular,
        nome_exercicio=treino.nome_exercicio,
        exercicio=ExercicioDoTreino(
            id=str(catalogo.id),
            wger_id=catalogo.wger_id,
            nome=catalogo.nome,
            grupo=catalogo.grupo,
            idioma=catalogo.idioma,
            musculos=catalogo.musculos or [],
            musculos_secundarios=catalogo.musculos_secundarios or [],
            equipamento=catalogo.equipamento or [],
            descricao=catalogo.descricao,
            imagem_url=catalogo.imagem_url,
        )
        if catalogo
        else None,
    )


# Plano de treino do usuário, ordenado por dia da semana e posição no dia
def listar_plano_treino(db: Session, usuario_id) -> List[TreinoPlanejadoResponse]:
    itens = db.query(TreinoPlanejado).filter(TreinoPlanejado.usuario_id == usuario_id).all()
    itens.sort(key=lambda t: (ORDEM_DIAS.index(t.dia_semana) if t.dia_semana in ORDEM_DIAS else 99, t.ordem or 1))
    return [montar_treino_planejado(t) for t in itens]
