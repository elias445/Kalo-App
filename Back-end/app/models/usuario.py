from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

# Tabela de usuários
class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    sexo = Column(String, nullable=True)
    idade = Column(Integer, nullable=True)
    altura = Column(Float, nullable=True)
    peso_atual = Column(Float, nullable=True)
    objetivo = Column(String, nullable=True)
    nivel_experiencia = Column(String, nullable=True)

    # Ligações com o histórico de peso e o diário de alimentos
    medidas = relationship("HistoricoMedidasModel", back_populates="usuario")
    refeicoes = relationship("DiarioAlimentosModel", back_populates="usuario")