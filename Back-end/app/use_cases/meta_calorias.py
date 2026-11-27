from typing import Optional
from sqlalchemy.orm import Session
from app.models.historico_medidas import HistoricoMedidasModel
from app.models.usuario import UsuarioModel

# Ajuste diário de calorias de cada objetivo (o mesmo do app)
AJUSTE_DO_OBJETIVO = {
    "Emagrecimento": -500,
    "Hipertrofia e Ganho de Massa": 300,
    "Definição Muscular": -250,
    "Manutenção e Saúde": 0,
    "Performance Esportiva": 200,
    "Bem-estar e Saúde Mental": 0,
}


# Meta diária de calorias (Mifflin-St Jeor x 1,55 mais o ajuste do objetivo), igual à calculada no app
def meta_calorias(db: Session, usuario: UsuarioModel) -> Optional[int]:
    if usuario.altura is None or usuario.idade is None or usuario.sexo is None:
        return None
    ultimo_peso = (
        db.query(HistoricoMedidasModel.peso_kg)
        .filter(HistoricoMedidasModel.usuario_id == usuario.id)
        .order_by(HistoricoMedidasModel.data_registro.desc())
        .first()
    )
    peso = ultimo_peso[0] if ultimo_peso else usuario.peso_atual
    if not peso:
        return None

    ajuste = AJUSTE_DO_OBJETIVO.get(usuario.objetivo or "", 0)
    base = 10 * peso + 6.25 * usuario.altura - 5 * usuario.idade + (-161 if usuario.sexo == "Feminino" else 5)
    # Arredonda para a dezena mais próxima (metade sobe, como o Math.round do app)
    return int((base * 1.55 + ajuste) / 10 + 0.5) * 10
