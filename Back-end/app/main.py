from fastapi import FastAPI
from app.database import engine, Base
from app.routers import usuario_router
import app.models  


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kalo API", version="1.0.0")

app.include_router(usuario_router.router)

@app.get("/")
def home():
    return {"status": "Servidor do Kalo rodando com sucesso!"}