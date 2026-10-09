from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class TreinoPlanejado(Base):
    __tablename__ = "treinos_planejados"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    dia_semana = Column(String, nullable=False)
    grupo_muscular = Column(String, nullable=False)
    nome_exercicio = Column(String, nullable=False)
    wger_exercicio_id = Column(Integer, nullable=True)
    series_planejadas = Column(String, nullable=False)
    ordem = Column(Integer, default=1)