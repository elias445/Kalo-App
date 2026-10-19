from sqlalchemy import Column, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

# Tabela do diário: cada alimento registrado numa refeição
class DiarioAlimentosModel(Base):
    __tablename__ = "diario_alimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    data_consumo = Column(Date, nullable=False)
    tipo_refeicao = Column(String, nullable=False) 
    nome_alimento = Column(String, nullable=False)
    quantidade_gramas = Column(Float, nullable=False)
    calorias = Column(Float, nullable=False)
    carboidratos = Column(Float, nullable=False)
    proteinas = Column(Float, nullable=False)
    gorduras = Column(Float, nullable=False)

    # Ligação com o usuário dono do registro
    usuario = relationship("UsuarioModel", back_populates="refeicoes")