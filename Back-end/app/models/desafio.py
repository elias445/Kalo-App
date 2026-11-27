from datetime import datetime
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


# Tabela dos desafios entre amigos
class Desafio(Base):
    __tablename__ = "desafios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    criador_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String, nullable=False)
    duracao_dias = Column(Integer, nullable=False)
    # Primeiro dia do desafio: só treinos e refeições a partir dele pontuam
    data_inicio = Column(Date, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    participantes = relationship("DesafioParticipante", back_populates="desafio", cascade="all, delete-orphan")


# Quem participa de cada desafio ("convidado" até aceitar; o criador já entra como "aceito")
class DesafioParticipante(Base):
    __tablename__ = "desafio_participantes"
    __table_args__ = (UniqueConstraint("desafio_id", "usuario_id", name="uq_desafio_participante"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    desafio_id = Column(UUID(as_uuid=True), ForeignKey("desafios.id"), nullable=False, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="convidado")

    desafio = relationship("Desafio", back_populates="participantes")
