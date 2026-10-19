from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.diario_alimentos import DiarioAlimentosCreate, DiarioAlimentosResponse
from app.security import obter_usuario_logado
from app.use_cases.listar_refeicoes import listar_refeicoes
from app.use_cases.registrar_refeicao import registrar_refeicao
from app.use_cases.remover_refeicao import remover_refeicao

router = APIRouter(prefix="/refeicoes", tags=["Diário de Refeições"])


@router.get("/usuario/{usuario_id}")
def listar_refeicoes_usuario(
    usuario_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado ao diário de outro usuário")

    return listar_refeicoes(db=db, usuario_id=usuario_id)


@router.post("/", response_model=DiarioAlimentosResponse)
def adicionar_refeicao(
    refeicao: DiarioAlimentosCreate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(refeicao.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado. Você não pode adicionar itens para outro usuário.")

    return registrar_refeicao(db=db, refeicao=refeicao)


@router.delete("/{refeicao_id}")
def deletar_refeicao(
    refeicao_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    remover_refeicao(db=db, refeicao_id=refeicao_id, usuario_id_logado=usuario_id_logado)
    return {"status": "Refeição deletada com sucesso!"}
