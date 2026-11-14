from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.desafio import Desafio, DesafioParticipante
from app.schemas.comunidade import DesafioCreate
from app.use_cases.datas_treino import data_de_hoje
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.ids_amigos import ids_amigos


# Cria um desafio e convida amigos (o criador já entra; só amigos podem ser convidados)
def criar_desafio(db: Session, usuario_id, dados: DesafioCreate) -> dict:
    exigir_usuario(db, usuario_id)
    convidados = set(dados.convidados)
    if usuario_id in convidados:
        raise HTTPException(status_code=422, detail="Você já participa do desafio que criou.")
    if not convidados <= ids_amigos(db, usuario_id):
        raise HTTPException(status_code=403, detail="Só é possível convidar quem já é seu amigo.")

    desafio = Desafio(
        criador_id=usuario_id,
        nome=dados.nome.strip(),
        duracao_dias=dados.duracao_dias,
        data_inicio=data_de_hoje(dados.hoje),
    )
    desafio.participantes.append(DesafioParticipante(usuario_id=usuario_id, status="aceito"))
    for convidado in convidados:
        desafio.participantes.append(DesafioParticipante(usuario_id=convidado, status="convidado"))
    db.add(desafio)
    db.commit()
    db.refresh(desafio)
    return {"id": desafio.id, "nome": desafio.nome, "duracao_dias": desafio.duracao_dias, "data_inicio": desafio.data_inicio}
