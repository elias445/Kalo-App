import json
import unicodedata
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.alimento import AlimentoModel

ARQUIVO_TACO = Path(__file__).resolve().parent.parent / "data" / "taco.json"


def normalizar(texto: str) -> str:
    sem_acento = unicodedata.normalize("NFD", texto)
    sem_acento = "".join(c for c in sem_acento if unicodedata.category(c) != "Mn")
    return sem_acento.lower().strip()


def carregar_taco_se_vazio(db: Session) -> int:
    db.execute(text("ALTER TABLE alimentos ADD COLUMN IF NOT EXISTS nutrientes JSONB"))
    db.commit()

    with open(ARQUIVO_TACO, encoding="utf-8") as arquivo:
        itens = json.load(arquivo)

    if db.query(AlimentoModel).first() is None:
        db.add_all(
            AlimentoModel(
                nome=item["nome"].strip(),
                nome_busca=normalizar(item["nome"]),
                categoria=item["categoria"],
                fonte="TACO",
                kcal_100g=item["kcal"],
                proteina_100g=item["proteina"],
                carboidrato_100g=item["carboidrato"],
                gordura_100g=item["gordura"],
                fibra_100g=item.get("fibra") or 0,
                nutrientes=item.get("nutrientes") or {},
            )
            for item in itens
        )
        db.commit()
        return len(itens)
    
    por_nome = {item["nome"].strip(): item.get("nutrientes") or {} for item in itens}
    pendentes = db.query(AlimentoModel).filter(AlimentoModel.nutrientes.is_(None)).all()
    for alimento in pendentes:
        alimento.nutrientes = por_nome.get(alimento.nome, {})
    db.commit()
    return len(pendentes)
