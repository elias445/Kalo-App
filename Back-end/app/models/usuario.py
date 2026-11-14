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
    # Quantos dias por semana o usuário quer treinar
    dias_treino = Column(Integer, nullable=True)
    # Dias da semana escolhidos para treinar, separados por vírgula (ex.: Seg,Qua,Sex)
    dias_preferidos = Column(String, nullable=True)
    # @usuario escolhido no cadastro (único, em minúsculas, sem o @)
    usuario = Column(String, unique=True, index=True, nullable=True)
    # Código curto para os amigos adicionarem o usuário
    codigo_convite = Column(String, unique=True, index=True, nullable=True)

    # Ligações com o histórico de peso e o diário de alimentos
    medidas = relationship("HistoricoMedidasModel", back_populates="usuario")
    refeicoes = relationship("DiarioAlimentosModel", back_populates="usuario")