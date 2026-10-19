from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel


def remover_refeicao(db: Session, refeicao_id, usuario_id_logado: str) -> None:
    refeicao = db.query(DiarioAlimentosModel).filter(DiarioAlimentosModel.id == refeicao_id).first()
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")

    if str(refeicao.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Você não pode deletar uma refeição de outro usuário")

    db.delete(refeicao)
    db.commit()
