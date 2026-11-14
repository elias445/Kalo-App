import re
import unicodedata
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.use_cases.codigo_convite import gerar_codigo_convite


# Gera um @usuario livre a partir do nome (ex.: "João Amorim" vira "joao.amorim"; se já existir, "joao.amorim2")
def _usuario_a_partir_do_nome(nome: str, em_uso: set) -> str:
    sem_acento = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-z0-9]+", ".", sem_acento.lower()).strip(".")[:16] or "usuario"
    if len(base) < 3:
        base = f"{base}user"
    candidato, numero = base, 1
    while candidato in em_uso:
        numero += 1
        candidato = f"{base}{numero}"
    return candidato


# Adiciona em bancos antigos o @usuario e o código de convite, e preenche os de quem já tinha conta
def migrar_comunidade(db: Session) -> None:
    db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS usuario VARCHAR"))
    db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_convite VARCHAR"))
    db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_usuarios_usuario ON usuarios (usuario)"))
    db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_usuarios_codigo_convite ON usuarios (codigo_convite)"))
    db.commit()

    em_uso = {linha[0] for linha in db.query(UsuarioModel.usuario).filter(UsuarioModel.usuario.isnot(None)).all()}
    for conta in db.query(UsuarioModel).filter(UsuarioModel.usuario.is_(None)).all():
        conta.usuario = _usuario_a_partir_do_nome(conta.nome, em_uso)
        em_uso.add(conta.usuario)
    for conta in db.query(UsuarioModel).filter(UsuarioModel.codigo_convite.is_(None)).all():
        conta.codigo_convite = gerar_codigo_convite(db)
        db.flush()
    db.commit()
