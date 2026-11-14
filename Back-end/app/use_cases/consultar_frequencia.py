import calendar
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.sessao_treino import SessaoTreino
from app.models.treino_planejado import TreinoPlanejado
from app.schemas.sessao_treino import FrequenciaResponse
from app.use_cases.datas_treino import dia_da_semana, validar_data_recente
from app.use_cases.exigir_usuario import exigir_usuario


# Frequência de treino do mês: dias treinados, consistência (feitos ÷ planejados) e sequência
def consultar_frequencia(db: Session, usuario_id, mes: str, hoje: Optional[date] = None) -> FrequenciaResponse:
    exigir_usuario(db, usuario_id)
    try:
        ano, numero_mes = (int(parte) for parte in mes.split("-"))
        ultimo_dia = calendar.monthrange(ano, numero_mes)[1]
    except (ValueError, calendar.IllegalMonthError):
        raise HTTPException(status_code=422, detail="Mês inválido (use AAAA-MM)")

    hoje = hoje or datetime.utcnow().date()
    validar_data_recente(hoje)

    datas_treinadas = {
        linha[0] for linha in db.query(SessaoTreino.data_treino).filter(SessaoTreino.usuario_id == usuario_id).all()
    }
    dias_planejados = {
        linha[0]
        for linha in db.query(TreinoPlanejado.dia_semana).filter(TreinoPlanejado.usuario_id == usuario_id).distinct().all()
    }

    # Dias do mês com treino planejado que já venceram (o treino de hoje só conta se já foi feito)
    vencidos = []
    for dia in range(1, ultimo_dia + 1):
        data = date(ano, numero_mes, dia)
        if data > hoje or dia_da_semana(data) not in dias_planejados:
            continue
        if data == hoje and data not in datas_treinadas:
            continue
        vencidos.append(data)
    feitos = sum(1 for data in vencidos if data in datas_treinadas)
    consistencia = round(feitos / len(vencidos) * 100) if vencidos else 100

    # Sequência: treinos planejados cumpridos em seguida, até a primeira falta (descanso não quebra)
    sequencia = 0
    for atras in range(0, 366):
        data = hoje - timedelta(days=atras)
        if dia_da_semana(data) not in dias_planejados:
            continue
        if data in datas_treinadas:
            sequencia += 1
        elif data != hoje:
            break

    do_mes = sorted(d.day for d in datas_treinadas if d.year == ano and d.month == numero_mes)
    return FrequenciaResponse(
        mes=mes,
        dias_treinados=do_mes,
        total_treinos_mes=len(do_mes),
        total_treinos=len(datas_treinadas),
        planejados_ate_hoje=len(vencidos),
        consistencia=consistencia,
        sequencia=sequencia,
        treinou_hoje=hoje in datas_treinadas,
    )
