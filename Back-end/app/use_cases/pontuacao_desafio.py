from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.diario_alimentos import DiarioAlimentosModel
from app.models.usuario import UsuarioModel
from app.use_cases.estatisticas_treino import calcular_sequencia, datas_treinadas, dias_planejados
from app.use_cases.meta_calorias import meta_calorias

# Regras de pontuação do desafio
PONTOS_TREINO = 50
PONTOS_META_CALORIAS = 30
PONTOS_POR_DIA_DE_SEQUENCIA = 10
# A meta de calorias conta como cumprida quando o dia fecha entre 90% e 110% dela
FAIXA_DA_META = (0.9, 1.1)


# Dias do período em que o usuário ficou na faixa da meta de calorias
def dias_com_meta_cumprida(db: Session, usuario: UsuarioModel, inicio: date, fim: date) -> int:
    meta = meta_calorias(db, usuario)
    if not meta:
        return 0
    totais = (
        db.query(DiarioAlimentosModel.data_consumo, func.sum(DiarioAlimentosModel.calorias))
        .filter(
            DiarioAlimentosModel.usuario_id == usuario.id,
            DiarioAlimentosModel.data_consumo >= inicio,
            DiarioAlimentosModel.data_consumo <= fim,
        )
        .group_by(DiarioAlimentosModel.data_consumo)
        .all()
    )
    minimo, maximo = meta * FAIXA_DA_META[0], meta * FAIXA_DA_META[1]
    return sum(1 for _, total in totais if minimo <= (total or 0) <= maximo)


# Pontos do usuário num desafio, contando só o que aconteceu entre o início e hoje (ou o fim, se já acabou)
def calcular_pontos(db: Session, usuario: UsuarioModel, inicio: date, fim: date, hoje: date) -> dict:
    limite = min(fim, hoje)
    treinadas = datas_treinadas(db, usuario.id, inicio, limite)
    sequencia = calcular_sequencia(treinadas, dias_planejados(db, usuario.id), limite, inicio)
    dias_meta = dias_com_meta_cumprida(db, usuario, inicio, limite)

    pontos_treinos = len(treinadas) * PONTOS_TREINO
    pontos_sequencia = sequencia * PONTOS_POR_DIA_DE_SEQUENCIA
    pontos_calorias = dias_meta * PONTOS_META_CALORIAS
    return {
        "pontos": pontos_treinos + pontos_sequencia + pontos_calorias,
        "treinos": len(treinadas),
        "sequencia": sequencia,
        "dias_meta_calorias": dias_meta,
        "detalhe": {"treinos": pontos_treinos, "sequencia": pontos_sequencia, "calorias": pontos_calorias},
    }
