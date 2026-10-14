from fastapi import FastAPI
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuario_router , medidas_router, refeicoes_router
import app.models  


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kalo API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router.router)
app.include_router(medidas_router.router)
app.include_router(refeicoes_router.router)

@app.get("/")
def home():
    return {"status": "Servidor do Kalo rodando com sucesso!"}