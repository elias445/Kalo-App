from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from app.database import Base


# Tabela de exercícios (catálogo importado do wger)
class ExercicioModel(Base):
    __tablename__ = "exercicios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wger_id = Column(Integer, unique=True, nullable=False)
    nome = Column(String, nullable=False)
    # nome sem acento e em minúsculas, usado na busca
    nome_busca = Column(String, nullable=False, index=True)
    nome_en = Column(String, nullable=True)
    idioma = Column(String, nullable=False, default="pt")
    categoria = Column(String, nullable=False)
    grupo = Column(String, nullable=False, index=True)
    musculos = Column(JSONB, nullable=True)
    musculos_secundarios = Column(JSONB, nullable=True)
    equipamento = Column(JSONB, nullable=True)
    descricao = Column(Text, nullable=True)
    imagem_url = Column(String, nullable=True)
