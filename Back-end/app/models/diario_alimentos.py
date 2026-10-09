from sqlalchemy import Column, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class DiarioAlimentosModel(Base):
    __tablename__ = "diario_alimentos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey("usuarios.id"))
    data_consumo = Column(Date, nullable=False)
    tipo_refeicao = Column(String, nullable=False) 
    nome_alimento = Column(String, nullable=False)
    quantidade_gramas = Column(Float, nullable=False)
    calorias = Column(Float, nullable=False)
    carboidratos = Column(Float, nullable=False)
    proteinas = Column(Float, nullable=False)
    gorduras = Column(Float, nullable=False)

    usuario = relationship("UsuarioModel", back_populates="refeicoes")