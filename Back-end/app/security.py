import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv() 

# Chave usada para assinar os tokens (vem do .env)
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta_temporaria_do_app_em_quannto_não_tem_na_env") 
# Algoritmo de assinatura do JWT
ALGORITHM = "HS256"
# Validade do token: 7 dias
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Configuração do bcrypt para as senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Exige o header Authorization: Bearer <token>
oauth2_scheme = HTTPBearer()

# Compara a senha digitada com o hash salvo
def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)

# Transforma a senha em hash antes de salvar
def gerar_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

# Cria o JWT com o id do usuário e a data de expiração
def criar_token_acesso(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

# Lê o token da requisição e devolve o id do usuário logado
def obter_usuario_logado(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return usuario_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faça login novamente.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Credenciais inválidas. Token falso.")