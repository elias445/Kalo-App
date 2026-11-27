from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from app.models.desafio import Desafio, DesafioParticipante
from app.models.usuario import UsuarioModel
from app.use_cases.datas_treino import data_de_hoje
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.ranking_desafio import descrever_desafio, ranking_do_desafio


# Desafios do usuário: os que participa (com posição e pontos) e os convites que ainda não respondeu
def listar_desafios(db: Session, usuario_id, hoje: Optional[date] = None) -> dict:
    exigir_usuario(db, usuario_id)
    hoje = data_de_hoje(hoje)

    meus = (
        db.query(DesafioParticipante)
        .filter(DesafioParticipante.usuario_id == usuario_id)
        .join(Desafio, Desafio.id == DesafioParticipante.desafio_id)
        .order_by(Desafio.criado_em.desc())
        .all()
    )
    resposta = {"ativos": [], "convites": []}
    for participacao in meus:
        desafio = participacao.desafio
        item = descrever_desafio(desafio, hoje)
        criador = db.get(UsuarioModel, desafio.criador_id)
        item["criador"] = criador.nome if criador else None
        # O criador não pode sair do próprio desafio
        item["sou_criador"] = desafio.criador_id == usuario_id

        if participacao.status == "convidado":
            resposta["convites"].append(item)
            continue
        ranking = ranking_do_desafio(db, desafio, usuario_id, hoje)
        meu = next((linha for linha in ranking if linha["eu"]), None)
        item["participantes"] = len(ranking)
        item["minha_posicao"] = meu["posicao"] if meu else None
        item["meus_pontos"] = meu["pontos"] if meu else 0
        resposta["ativos"].append(item)
    return resposta
