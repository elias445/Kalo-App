from datetime import datetime
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


# Tabela dos treinos concluídos pelo usuário (um por dia)
class SessaoTreino(Base):
    __tablename__ = "sessoes_treino"
    __table_args__ = (UniqueConstraint("usuario_id", "data_treino", name="uq_sessao_usuario_data"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    data_treino = Column(Date, nullable=False)
    dia_semana = Column(String, nullable=False)
    exercicios_planejados = Column(Integer, nullable=False)
    exercicios_concluidos = Column(Integer, nullable=False)
    # Momento em que o servidor recebeu o registro
    concluido_em = Column(DateTime, default=datetime.utcnow)
