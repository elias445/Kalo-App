from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

# Tabela de preferências de notificação por refeição de cada usuário
class PreferenciaNotificacaoModel(Base):
    __tablename__ = "preferencias_notificacao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, unique=True)

    # Café da manhã
    cafe_ativo = Column(Boolean, default=True, nullable=False)
    cafe_hora = Column(Integer, default=8, nullable=False)    # hora (0-23)
    cafe_minuto = Column(Integer, default=0, nullable=False)  # minuto (0-59)

    # Lanche da manhã
    lanche_manha_ativo = Column(Boolean, default=True, nullable=False)
    lanche_manha_hora = Column(Integer, default=10, nullable=False)
    lanche_manha_minuto = Column(Integer, default=30, nullable=False)

    # Almoço
    almoco_ativo = Column(Boolean, default=True, nullable=False)
    almoco_hora = Column(Integer, default=12, nullable=False)
    almoco_minuto = Column(Integer, default=30, nullable=False)

    # Lanche da tarde
    lanche_tarde_ativo = Column(Boolean, default=True, nullable=False)
    lanche_tarde_hora = Column(Integer, default=16, nullable=False)
    lanche_tarde_minuto = Column(Integer, default=0, nullable=False)

    # Jantar
    jantar_ativo = Column(Boolean, default=True, nullable=False)
    jantar_hora = Column(Integer, default=19, nullable=False)
    jantar_minuto = Column(Integer, default=30, nullable=False)

    # Ceia
    ceia_ativo = Column(Boolean, default=True, nullable=False)
    ceia_hora = Column(Integer, default=22, nullable=False)
    ceia_minuto = Column(Integer, default=0, nullable=False)

    # Ligação com o usuário dono das preferências
    usuario = relationship("UsuarioModel", back_populates="preferencia_notificacao")
