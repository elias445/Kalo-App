from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.sessao_treino import SessaoTreino
from app.models.treino_planejado import TreinoPlanejado
from app.use_cases.datas_treino import dia_da_semana


# Datas em que o usuário concluiu o treino (opcionalmente só as de um período)
def datas_treinadas(db: Session, usuario_id, desde: Optional[date] = None, ate: Optional[date] = None) -> set:
    consulta = db.query(SessaoTreino.data_treino).filter(SessaoTreino.usuario_id == usuario_id)
    if desde:
        consulta = consulta.filter(SessaoTreino.data_treino >= desde)
    if ate:
        consulta = consulta.filter(SessaoTreino.data_treino <= ate)
    return {linha[0] for linha in consulta.all()}


# Dias da semana em que o plano atual do usuário tem treino
def dias_planejados(db: Session, usuario_id) -> set:
    linhas = db.query(TreinoPlanejado.dia_semana).filter(TreinoPlanejado.usuario_id == usuario_id).distinct().all()
    return {linha[0] for linha in linhas}


# Treinos planejados cumpridos em seguida, voltando a partir de hoje até a primeira falta (descanso não quebra)
def calcular_sequencia(treinadas: set, planejados: set, hoje: date, desde: Optional[date] = None) -> int:
    sequencia = 0
    for atras in range(0, 366):
        data = hoje - timedelta(days=atras)
        if desde and data < desde:
            break
        if dia_da_semana(data) not in planejados:
            continue
        if data in treinadas:
            sequencia += 1
        elif data != hoje:
            break
    return sequencia
