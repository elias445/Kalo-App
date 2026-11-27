from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.schemas.usuario import PADRAO_USUARIO, normalizar_usuario


# Diz se o @usuario digitado é válido e ainda está livre (usado pelo app enquanto a pessoa digita)
def verificar_usuario_disponivel(db: Session, usuario: str) -> dict:
    limpo = normalizar_usuario(usuario)
    if not PADRAO_USUARIO.match(limpo):
        return {"usuario": limpo, "valido": False, "disponivel": False}
    existe = db.query(UsuarioModel.id).filter(UsuarioModel.usuario == limpo).first() is not None
    return {"usuario": limpo, "valido": True, "disponivel": not existe}
