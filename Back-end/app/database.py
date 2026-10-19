import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


# Carrega as variáveis do arquivo .env
load_dotenv()


# Endereço do banco de dados (vem do .env)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")


# Conexão com o PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Fábrica de sessões para conversar com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base de todos os models (tabelas)
Base = declarative_base()

# Abre uma sessão por requisição e fecha no final
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()