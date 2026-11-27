from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.preferencia_notificacao import PreferenciaNotificacaoUpsert, PreferenciaNotificacaoResponse
from app.security import obter_usuario_logado
from app.use_cases.obter_preferencias_notificacao import obter_preferencias_notificacao
from app.use_cases.atualizar_preferencias_notificacao import atualizar_preferencias_notificacao

# Agrupa as rotas sob /notificacoes
router = APIRouter(prefix="/notificacoes", tags=["Preferências de Notificação"])


# GET /notificacoes/{usuario_id}: retorna as preferências de notificação do usuário
@router.get("/{usuario_id}", response_model=PreferenciaNotificacaoResponse)
def buscar_preferencias(
    usuario_id: UUID4,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado às preferências de outro usuário")

    return obter_preferencias_notificacao(db=db, usuario_id=usuario_id)


# PUT /notificacoes/: cria ou atualiza as preferências de notificação
@router.put("/", response_model=PreferenciaNotificacaoResponse)
def salvar_preferencias(
    dados: PreferenciaNotificacaoUpsert,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    if str(dados.usuario_id) != usuario_id_logado:
        raise HTTPException(status_code=403, detail="Acesso negado. Você não pode alterar preferências de outro usuário.")

    return atualizar_preferencias_notificacao(db=db, dados=dados)
