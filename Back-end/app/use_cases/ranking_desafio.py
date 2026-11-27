from datetime import date, timedelta
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.desafio import Desafio
from app.models.usuario import UsuarioModel
from app.use_cases.datas_treino import data_de_hoje
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.pontuacao_desafio import calcular_pontos


# Dados do desafio com o dia em que ele está (1 a duração) e se já acabou
def descrever_desafio(desafio: Desafio, hoje: date) -> dict:
    fim = desafio.data_inicio + timedelta(days=desafio.duracao_dias - 1)
    dia_atual = (hoje - desafio.data_inicio).days + 1
    return {
        "id": desafio.id,
        "nome": desafio.nome,
        "duracao_dias": desafio.duracao_dias,
        "data_inicio": desafio.data_inicio,
        "data_fim": fim,
        "dia_atual": max(1, min(dia_atual, desafio.duracao_dias)),
        "encerrado": hoje > fim,
        "criador_id": desafio.criador_id,
    }


# Ranking do desafio: participantes que aceitaram, do mais ao menos pontuado
def ranking_do_desafio(db: Session, desafio: Desafio, usuario_id, hoje: date) -> list:
    info = descrever_desafio(desafio, hoje)
    linhas = []
    for participante in desafio.participantes:
        if participante.status != "aceito":
            continue
        pessoa = db.get(UsuarioModel, participante.usuario_id)
        if pessoa is None:
            continue
        pontos = calcular_pontos(db, pessoa, desafio.data_inicio, info["data_fim"], hoje)
        linhas.append({
            "id": pessoa.id,
            "nome": pessoa.nome,
            "usuario": pessoa.usuario,
            "objetivo": pessoa.objetivo,
            "eu": pessoa.id == usuario_id,
            **pontos,
        })
    # Empate em pontos: quem tem mais treinos fica na frente, depois o nome
    linhas.sort(key=lambda l: (-l["pontos"], -l["treinos"], l["nome"].lower()))
    for posicao, linha in enumerate(linhas, start=1):
        linha["posicao"] = posicao
    return linhas


# GET do ranking de um desafio (só quem participa pode ver)
def consultar_ranking_desafio(db: Session, usuario_id, desafio_id, hoje: Optional[date] = None) -> dict:
    exigir_usuario(db, usuario_id)
    hoje = data_de_hoje(hoje)
    desafio = db.get(Desafio, desafio_id)
    if desafio is None:
        raise HTTPException(status_code=404, detail="Desafio não encontrado.")
    if not any(p.usuario_id == usuario_id and p.status == "aceito" for p in desafio.participantes):
        raise HTTPException(status_code=403, detail="Você não participa desse desafio.")
    return {"desafio": descrever_desafio(desafio, hoje), "ranking": ranking_do_desafio(db, desafio, usuario_id, hoje)}
