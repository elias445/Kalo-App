from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioOnboarding
from app.security import obter_usuario_logado
from app.use_cases.cadastrar_usuario import cadastrar_usuario
from app.use_cases.realizar_login import realizar_login
from app.use_cases.salvar_onboarding import salvar_onboarding
from app.use_cases.sessao import iniciar_sessao

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.post("/cadastro")
def cadastro(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    novo_usuario = cadastrar_usuario(db=db, usuario=usuario)
    return iniciar_sessao(novo_usuario)


@router.post("/login")
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = realizar_login(db=db, dados=dados)
    return iniciar_sessao(usuario)


@router.put("/onboarding")
def onboarding(
    dados: UsuarioOnboarding,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    salvar_onboarding(db=db, usuario_id=usuario_id_logado, dados=dados)
    return {"status": "Onboarding salvo com sucesso"}
