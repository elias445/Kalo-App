from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioCreate, UsuarioLogin , UsuarioOnboarding
from app.security import verificar_senha, gerar_hash_senha, criar_token_acesso, obter_usuario_logado

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


def dados_do_usuario(usuario: UsuarioModel) -> dict:
    campos_do_onboarding = [usuario.sexo, usuario.idade, usuario.altura, usuario.peso_atual, usuario.objetivo]
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "sexo": usuario.sexo,
        "idade": usuario.idade,
        "altura": usuario.altura,
        "peso_atual": usuario.peso_atual,
        "objetivo": usuario.objetivo,
        "onboarding_completo": all(campo is not None for campo in campos_do_onboarding),
    }

@router.post("/cadastro")
def cadastrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(UsuarioModel).filter(UsuarioModel.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está em uso.")


    novo_usuario = UsuarioModel(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=gerar_hash_senha(usuario.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    token = criar_token_acesso({"sub": str(novo_usuario.id)})

    return {
        "token": token,
        "usuario": dados_do_usuario(novo_usuario)
    }

@router.post("/login")
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioModel).filter(UsuarioModel.email == dados.email).first()
    
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")


    token = criar_token_acesso({"sub": str(usuario.id)})

    return {
        "token": token,
        "usuario": dados_do_usuario(usuario)
    }
@router.put("/onboarding")
def salvar_dados_onboarding(
    dados: UsuarioOnboarding, 
    db: Session = Depends(get_db),
    usuario_id_logado: str = Depends(obter_usuario_logado) 
):
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id_logado).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario.sexo = dados.sexo
    usuario.idade = dados.idade
    usuario.altura = dados.altura
    usuario.peso_atual = dados.peso_atual
    usuario.objetivo = dados.objetivo
    
    db.commit()
    
    return {"status": "Onboarding salvo com sucesso"}