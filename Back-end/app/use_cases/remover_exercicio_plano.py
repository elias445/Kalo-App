from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.treino_planejado import TreinoPlanejado


# Remove um exercício do plano (só o dono pode)
def remover_exercicio_plano(db: Session, usuario_id, treino_id) -> None:
    treino = db.query(TreinoPlanejado).filter(TreinoPlanejado.id == treino_id).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Exercício do plano não encontrado")
    if str(treino.usuario_id) != str(usuario_id):
        raise HTTPException(status_code=403, detail="Você não pode alterar o plano de outro usuário")

    db.delete(treino)
    db.commit()
