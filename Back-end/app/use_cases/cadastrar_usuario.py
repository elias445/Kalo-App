from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def cadastrar_usuario(db: Session, usuario: UsuarioCreate):
    senha_criptografada = pwd_context.hash(usuario.senha)
    
    db_usuario = UsuarioModel(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=senha_criptografada,
        objetivo=usuario.objetivo,
        nivel_experiencia=usuario.nivel_experiencia
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario