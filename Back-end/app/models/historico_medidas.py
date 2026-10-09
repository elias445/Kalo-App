from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class HistoricoMedidasModel(Base):
    __tablename__ = "historico_medidas"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    data_registro = Column(DateTime, default=datetime.utcnow)
    peso_kg = Column(Float, nullable=False)
    percentual_gordura = Column(Float, nullable=True)

    usuario = relationship("UsuarioModel", back_populates="medidas")