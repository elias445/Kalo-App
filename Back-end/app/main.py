from fastapi import FastAPI
from app.database import engine, Base, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuario_router , medidas_router, refeicoes_router, alimentos_router, exercicios_router, treinos_router
from app.use_cases.carregar_taco import carregar_taco_se_vazio
from app.use_cases.carregar_wger import carregar_wger_se_vazio
from app.use_cases.migrar_treinos import migrar_treinos_planejados, migrar_usuarios
# Importa os models para o create_all enxergá-los
import app.models  


# Cria as tabelas que ainda não existem
Base.metadata.create_all(bind=engine)

# Carrega os alimentos da TACO se a tabela estiver vazia
with SessionLocal() as db:
    carregar_taco_se_vazio(db)
    carregar_wger_se_vazio(db)
    migrar_treinos_planejados(db)
    migrar_usuarios(db)

# Aplicação principal da API
app = FastAPI(title="Kalo API", version="1.0.0")

# Libera o acesso do app mobile (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas de cada módulo
app.include_router(usuario_router.router)
app.include_router(medidas_router.router)
app.include_router(refeicoes_router.router)
app.include_router(alimentos_router.router)
app.include_router(exercicios_router.router)
app.include_router(treinos_router.router)

# Rota para testar se o servidor está no ar
@app.get("/")
def home():
    return {"status": "Servidor do Kalo rodando com sucesso!"}