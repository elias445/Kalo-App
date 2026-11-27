from typing import List
from sqlalchemy.orm import Session
from app.models.amizade import Amizade
from app.models.usuario import UsuarioModel
from app.schemas.usuario import normalizar_usuario
from app.use_cases.exigir_usuario import exigir_usuario


# Busca pessoas pelo começo do @usuario (mínimo de 2 caracteres) para convidar; não lista quem já é amigo ou já foi convidado
def buscar_usuarios(db: Session, usuario_id, texto: str, limite: int = 10) -> List[dict]:
    exigir_usuario(db, usuario_id)
    busca = normalizar_usuario(texto)
    if len(busca) < 2:
        return []

    relacionados = set()
    for amizade in db.query(Amizade).filter((Amizade.solicitante_id == usuario_id) | (Amizade.destinatario_id == usuario_id)):
        relacionados.add(amizade.destinatario_id if amizade.solicitante_id == usuario_id else amizade.solicitante_id)

    # Escapa os curingas do LIKE para o texto digitado valer ao pé da letra
    padrao = busca.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    pessoas = (
        db.query(UsuarioModel)
        .filter(UsuarioModel.usuario.like(padrao, escape="\\"), UsuarioModel.id != usuario_id)
        .order_by(UsuarioModel.usuario)
        .limit(limite + len(relacionados))
        .all()
    )
    return [
        {"id": p.id, "nome": p.nome, "usuario": p.usuario}
        for p in pessoas
        if p.id not in relacionados
    ][:limite]
