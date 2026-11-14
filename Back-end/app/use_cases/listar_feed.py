from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.atividade import Atividade, Curtida
from app.models.usuario import UsuarioModel
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.ids_amigos import ids_amigos


# Feed: o que o usuário e os amigos fizeram, do mais recente ao mais antigo, com as curtidas
def listar_feed(db: Session, usuario_id, limite: int = 30) -> list:
    exigir_usuario(db, usuario_id)
    autores = ids_amigos(db, usuario_id) | {usuario_id}

    atividades = (
        db.query(Atividade)
        .filter(Atividade.usuario_id.in_(autores))
        .order_by(Atividade.criado_em.desc())
        .limit(limite)
        .all()
    )
    if not atividades:
        return []

    ids = [a.id for a in atividades]
    totais = dict(
        db.query(Curtida.atividade_id, func.count(Curtida.id)).filter(Curtida.atividade_id.in_(ids)).group_by(Curtida.atividade_id).all()
    )
    minhas = {linha[0] for linha in db.query(Curtida.atividade_id).filter(Curtida.atividade_id.in_(ids), Curtida.usuario_id == usuario_id)}
    nomes = {p.id: p for p in db.query(UsuarioModel).filter(UsuarioModel.id.in_({a.usuario_id for a in atividades}))}

    return [
        {
            "id": a.id,
            "autor": nomes[a.usuario_id].nome,
            "usuario": nomes[a.usuario_id].usuario,
            "minha": a.usuario_id == usuario_id,
            "tipo": a.tipo,
            "acao": a.acao,
            "detalhe": a.detalhe,
            # Horário em UTC, com o Z para o app converter para o horário do celular
            "criado_em": a.criado_em.isoformat() + "Z",
            "curtidas": totais.get(a.id, 0),
            "curtiu": a.id in minhas,
        }
        for a in atividades
    ]
