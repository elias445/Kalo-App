from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


# Tabela do feed: o que cada usuário fez (treino concluído, sequência de dias)
class Atividade(Base):
    __tablename__ = "atividades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, index=True)
    tipo = Column(String, nullable=False)
    acao = Column(String, nullable=False)
    detalhe = Column(String, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, index=True)


# Curtidas das atividades (uma por usuário em cada atividade)
class Curtida(Base):
    __tablename__ = "curtidas"
    __table_args__ = (UniqueConstraint("atividade_id", "usuario_id", name="uq_curtida_atividade_usuario"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    atividade_id = Column(UUID(as_uuid=True), ForeignKey("atividades.id"), nullable=False, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
