from sqlalchemy import Column, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from datetime import datetime
import uuid

# Tabela do histórico de peso do usuário
class HistoricoMedidasModel(Base):
    __tablename__ = "historico_medidas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    data_registro = Column(DateTime, default=datetime.utcnow)
    peso_kg = Column(Float, nullable=False)
    percentual_gordura = Column(Float, nullable=True)

    # Ligação com o usuário dono da medida
    usuario = relationship("UsuarioModel", back_populates="medidas")