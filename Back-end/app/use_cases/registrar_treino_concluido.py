from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.sessao_treino import SessaoTreino
from app.models.treino_planejado import TreinoPlanejado
from app.schemas.sessao_treino import SessaoTreinoCreate
from app.use_cases.datas_treino import dia_da_semana, validar_data_recente
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.publicar_atividades_treino import publicar_atividades_treino


# Registra o treino do dia como concluído (um por dia, só em dia com treino planejado)
def registrar_treino_concluido(db: Session, usuario_id, dados: SessaoTreinoCreate) -> SessaoTreino:
    exigir_usuario(db, usuario_id)
    validar_data_recente(dados.data_treino)

    dia = dia_da_semana(dados.data_treino)
    planejados = (
        db.query(TreinoPlanejado)
        .filter(TreinoPlanejado.usuario_id == usuario_id, TreinoPlanejado.dia_semana == dia)
        .count()
    )
    if planejados == 0:
        raise HTTPException(status_code=422, detail="Não há treino planejado para este dia")
    if dados.exercicios_concluidos > planejados:
        raise HTTPException(status_code=422, detail="Mais exercícios concluídos do que os planejados")

    ja_registrado = (
        db.query(SessaoTreino)
        .filter(SessaoTreino.usuario_id == usuario_id, SessaoTreino.data_treino == dados.data_treino)
        .first()
    )
    if ja_registrado:
        raise HTTPException(status_code=409, detail="O treino deste dia já foi registrado")

    sessao = SessaoTreino(
        usuario_id=usuario_id,
        data_treino=dados.data_treino,
        dia_semana=dia,
        exercicios_planejados=planejados,
        exercicios_concluidos=dados.exercicios_concluidos,
    )
    db.add(sessao)
    db.commit()
    db.refresh(sessao)
    publicar_atividades_treino(db, usuario_id, sessao)
    return sessao
