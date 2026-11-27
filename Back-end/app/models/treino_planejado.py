from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


# Tabela dos exercícios planejados por dia da semana
class TreinoPlanejado(Base):
    __tablename__ = "treinos_planejados"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    # Exercício do catálogo (wger) usado neste ponto do plano
    exercicio_id = Column(UUID(as_uuid=True), ForeignKey("exercicios.id"), nullable=True)
    dia_semana = Column(String, nullable=False)
    grupo_muscular = Column(String, nullable=False)
    nome_exercicio = Column(String, nullable=False)
    wger_exercicio_id = Column(Integer, nullable=True)
    series_planejadas = Column(Integer, nullable=False, default=3)
    repeticoes = Column(Integer, nullable=False, default=12)
    carga_kg = Column(Float, nullable=False, default=0)
    ordem = Column(Integer, default=1)

    # Ligação com o exercício do catálogo
    exercicio = relationship("ExercicioModel")
