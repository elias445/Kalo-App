import calendar
from datetime import date, datetime
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.sessao_treino import FrequenciaResponse
from app.use_cases.datas_treino import dia_da_semana, validar_data_recente
from app.use_cases.estatisticas_treino import calcular_sequencia, datas_treinadas, dias_planejados
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

    datas_feitas = datas_treinadas(db, usuario_id)
    planejados = dias_planejados(db, usuario_id)

    # Dias do mês com treino planejado que já venceram (o treino de hoje só conta se já foi feito)
    vencidos = []
    for dia in range(1, ultimo_dia + 1):
        data = date(ano, numero_mes, dia)
        if data > hoje or dia_da_semana(data) not in planejados:
            continue
        if data == hoje and data not in datas_feitas:
            continue
        vencidos.append(data)
    feitos = sum(1 for data in vencidos if data in datas_feitas)
    consistencia = round(feitos / len(vencidos) * 100) if vencidos else 100

    # Sequência: treinos planejados cumpridos em seguida, até a primeira falta (descanso não quebra)
    sequencia = calcular_sequencia(datas_feitas, planejados, hoje)

    do_mes = sorted(d.day for d in datas_feitas if d.year == ano and d.month == numero_mes)
    return FrequenciaResponse(
        mes=mes,
        dias_treinados=do_mes,
        total_treinos_mes=len(do_mes),
        total_treinos=len(datas_feitas),
        planejados_ate_hoje=len(vencidos),
        consistencia=consistencia,
        sequencia=sequencia,
        treinou_hoje=hoje in datas_feitas,
    )
