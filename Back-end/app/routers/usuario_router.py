from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.use_cases.cadastrar_usuario import cadastrar_usuario

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/", response_model=UsuarioResponse)
def criar_novo_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return cadastrar_usuario(db=db, usuario=usuario)