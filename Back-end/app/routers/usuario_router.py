from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioOnboarding, UsuarioPerfilUpdate, UsuarioRefresh, TokenResponse
from app.security import obter_usuario_logado
from app.use_cases.cadastrar_usuario import cadastrar_usuario
from app.use_cases.editar_perfil import editar_perfil
from app.use_cases.realizar_login import realizar_login
from app.use_cases.renovar_sessao import renovar_sessao
from app.use_cases.salvar_onboarding import salvar_onboarding
from app.use_cases.sessao import iniciar_sessao
from app.use_cases.verificar_usuario_disponivel import verificar_usuario_disponivel

# Agrupa as rotas sob /usuarios
router = APIRouter(prefix="/usuarios", tags=["Usuários"])


# GET /usuarios/disponivel?usuario=: confere se o @usuario é válido e está livre (sem login, usado no cadastro)
@router.get("/disponivel")
def usuario_disponivel(usuario: str, db: Session = Depends(get_db)):
    return verificar_usuario_disponivel(db=db, usuario=usuario)


# POST /usuarios/cadastro: cria a conta e já inicia a sessão
@router.post("/cadastro")
def cadastro(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    novo_usuario = cadastrar_usuario(db=db, usuario=usuario)
    return iniciar_sessao(novo_usuario)


# POST /usuarios/login: confere as credenciais e inicia a sessão
@router.post("/login")
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = realizar_login(db=db, dados=dados)
    return iniciar_sessao(usuario)


# POST /usuarios/refresh: renova o token de acesso com o refresh token
@router.post("/refresh", response_model=TokenResponse)
def refresh(dados: UsuarioRefresh, db: Session = Depends(get_db)):
    return renovar_sessao(db=db, refresh_token=dados.refresh_token)


# PUT /usuarios/onboarding: salva os dados biométricos (exige login)
@router.put("/onboarding")
def onboarding(
    dados: UsuarioOnboarding,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    salvar_onboarding(db=db, usuario_id=usuario_id_logado, dados=dados)
    return {"status": "Onboarding salvo com sucesso"}


# PUT /usuarios/perfil: edita o perfil (exige login) e refaz o plano de treino se o objetivo, nível ou dias mudaram
@router.put("/perfil")
def perfil(
    dados: UsuarioPerfilUpdate,
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado),
):
    return editar_perfil(db=db, usuario_id=usuario_id_logado, dados=dados)
