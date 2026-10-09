from sqlalchemy import Column, Float, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class HistoricoTreino(Base):
    __tablename__ = "historico_treinos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    treino_planejado_id = Column(UUID(as_uuid=True), ForeignKey("treinos_planejados.id"), nullable=False)
    data_treino = Column(Date, nullable=False)
    carga_kg = Column(Float, nullable=True)
    concluido = Column(Boolean, default=False)