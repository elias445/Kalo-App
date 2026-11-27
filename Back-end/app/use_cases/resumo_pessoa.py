from datetime import date
from sqlalchemy.orm import Session
from app.models.usuario import UsuarioModel
from app.use_cases.estatisticas_treino import calcular_sequencia, datas_treinadas, dias_planejados


# O que os amigos podem ver de uma pessoa: nome, @usuario, objetivo, total de treinos e sequência atual
def resumo_pessoa(db: Session, pessoa: UsuarioModel, hoje: date) -> dict:
    treinadas = datas_treinadas(db, pessoa.id)
    return {
        "id": pessoa.id,
        "nome": pessoa.nome,
        "usuario": pessoa.usuario,
        "objetivo": pessoa.objetivo,
        "treinos": len(treinadas),
        "sequencia": calcular_sequencia(treinadas, dias_planejados(db, pessoa.id), hoje),
    }
