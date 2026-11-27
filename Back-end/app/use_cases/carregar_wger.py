import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.exercicio import ExercicioModel
from app.use_cases.carregar_taco import normalizar

# Arquivo com os exercícios do wger (gerado por scripts/gerar_wger_json.py)
ARQUIVO_WGER = Path(__file__).resolve().parent.parent / "data" / "wger.json"


# Popula a tabela de exercícios com o catálogo do wger na primeira execução
def carregar_wger_se_vazio(db: Session) -> int:
    if db.query(ExercicioModel).first() is not None:
        return 0

    with open(ARQUIVO_WGER, encoding="utf-8") as arquivo:
        itens = json.load(arquivo)

    db.add_all(
        ExercicioModel(
            wger_id=item["wger_id"],
            nome=item["nome"],
            nome_busca=normalizar(item["nome"]),
            nome_en=item.get("nome_en"),
            idioma=item["idioma"],
            categoria=item["categoria"],
            grupo=item["grupo"],
            musculos=item.get("musculos") or [],
            musculos_secundarios=item.get("musculos_secundarios") or [],
            equipamento=item.get("equipamento") or [],
            descricao=item.get("descricao"),
            imagem_url=item.get("imagem_url"),
        )
        for item in itens
    )
    db.commit()
    return len(itens)
