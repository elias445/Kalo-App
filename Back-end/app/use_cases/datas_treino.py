from datetime import date, datetime, timedelta
from fastapi import HTTPException

# Dias da semana, começando na segunda-feira (mesma ordem de date.weekday())
SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]


# Sigla do dia da semana de uma data
def dia_da_semana(data: date) -> str:
    return SEMANA[data.weekday()]


# Aceita só datas próximas de hoje no servidor (tolera o fuso do celular) para não registrar treino no passado
def validar_data_recente(data: date) -> None:
    hoje = datetime.utcnow().date()
    if not (hoje - timedelta(days=1) <= data <= hoje + timedelta(days=1)):
        raise HTTPException(status_code=422, detail="Data do treino inválida")
