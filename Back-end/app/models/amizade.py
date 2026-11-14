from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


# Tabela de amizades: um convite de quem pediu para quem recebeu (pendente até ser aceito)
class Amizade(Base):
    __tablename__ = "amizades"
    __table_args__ = (UniqueConstraint("solicitante_id", "destinatario_id", name="uq_amizade_par"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitante_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, index=True)
    destinatario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, index=True)
    # "pendente" enquanto o destinatário não responde e "aceita" depois que ele aceita
    status = Column(String, nullable=False, default="pendente")
    criado_em = Column(DateTime, default=datetime.utcnow)
