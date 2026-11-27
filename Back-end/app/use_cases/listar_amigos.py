from datetime import date
from typing import Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.amizade import Amizade
from app.models.usuario import UsuarioModel
from app.use_cases.datas_treino import data_de_hoje
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.resumo_pessoa import resumo_pessoa


# Amigos, convites recebidos e convites enviados do usuário
def listar_amigos(db: Session, usuario_id, hoje: Optional[date] = None) -> dict:
    exigir_usuario(db, usuario_id)
    hoje = data_de_hoje(hoje)

    amizades = (
        db.query(Amizade)
        .filter(or_(Amizade.solicitante_id == usuario_id, Amizade.destinatario_id == usuario_id))
        .order_by(Amizade.criado_em)
        .all()
    )
    eu = db.get(UsuarioModel, usuario_id)
    resposta = {
        "eu": {"usuario": eu.usuario, "codigo_convite": eu.codigo_convite},
        "amigos": [],
        "recebidos": [],
        "enviados": [],
    }
    for amizade in amizades:
        eu_convidei = amizade.solicitante_id == usuario_id
        pessoa = db.get(UsuarioModel, amizade.destinatario_id if eu_convidei else amizade.solicitante_id)
        if pessoa is None:
            continue
        # "id" é da pessoa (usado para convidar a desafios) e "amizade_id" serve para aceitar, recusar ou desfazer
        item = {**resumo_pessoa(db, pessoa, hoje), "amizade_id": amizade.id}
        if amizade.status == "aceita":
            resposta["amigos"].append(item)
        elif eu_convidei:
            resposta["enviados"].append(item)
        else:
            resposta["recebidos"].append(item)
    return resposta
