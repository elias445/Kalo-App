import secrets
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel

# Letras e números sem os que se confundem (0, O, 1, I)
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


# Gera um código de convite de 6 caracteres que ainda não pertence a nenhum usuário
def gerar_codigo_convite(db: Session) -> str:
    while True:
        codigo = "".join(secrets.choice(ALFABETO) for _ in range(6))
        if not db.query(UsuarioModel.id).filter(UsuarioModel.codigo_convite == codigo).first():
            return codigo
