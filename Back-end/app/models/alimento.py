from sqlalchemy import Column, String, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from app.database import Base


class AlimentoModel(Base):
    __tablename__ = "alimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    # nome sem acentos e em minúsculas, usado na busca
    nome_busca = Column(String, nullable=False, index=True)
    categoria = Column(String, nullable=False)
    fonte = Column(String, nullable=False, default="TACO")
    kcal_100g = Column(Float, nullable=False)
    proteina_100g = Column(Float, nullable=False)
    carboidrato_100g = Column(Float, nullable=False)
    gordura_100g = Column(Float, nullable=False)
    fibra_100g = Column(Float, nullable=False, default=0)
    nutrientes = Column(JSONB, nullable=True)
