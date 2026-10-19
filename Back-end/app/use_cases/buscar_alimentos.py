import json
import re
import urllib.parse
import urllib.request
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.alimento import AlimentoModel
from app.schemas.alimento import AlimentoBusca
from app.use_cases.carregar_taco import normalizar

# Endereço da API do Open Food Facts
URL_OPEN_FOOD_FACTS = "https://search.openfoodfacts.org/search"
# Identificação enviada à API
USER_AGENT = "Kalo/1.0 (projeto academico)"
# Tempo máximo de espera pela API
TIMEOUT_SEGUNDOS = 6


# Busca no nosso banco: todas as palavras digitadas precisam estar no nome
def buscar_na_taco(db: Session, termo: str, limite: int) -> List[AlimentoBusca]:
    consulta = db.query(AlimentoModel)
    for palavra in normalizar(termo).split():
        consulta = consulta.filter(AlimentoModel.nome_busca.contains(palavra))

    encontrados = consulta.order_by(func.length(AlimentoModel.nome), AlimentoModel.nome).limit(limite).all()

    return [
        AlimentoBusca(
            id=str(a.id),
            nome=a.nome,
            categoria=a.categoria,
            fonte="TACO",
            kcal_100g=a.kcal_100g,
            proteina_100g=a.proteina_100g,
            carboidrato_100g=a.carboidrato_100g,
            gordura_100g=a.gordura_100g,
            fibra_100g=a.fibra_100g,
            nutrientes=a.nutrientes or {},
        )
        for a in encontrados
    ]

# Devolve o valor se for número
def _numero(valor) -> Optional[float]:
    return float(valor) if isinstance(valor, (int, float)) else None

# Confere se as kcal batem com os macros (4, 4 e 9 kcal por grama)
def _calorias_coerentes(kcal: float, proteina: float, carboidrato: float, gordura: float) -> bool:
    estimado = 4 * proteina + 4 * carboidrato + 9 * gordura
    return abs(estimado - kcal) <= max(40, 0.3 * kcal)


# Pega fibra, açúcar, gorduras e sódio (em mg) do produto
def _nutrientes_extras(nutrientes: dict) -> dict:
    extras = {}
    for chave_off, chave in (
        ("fiber_100g", "fibra"),
        ("sugars_100g", "acucares"),
        ("saturated-fat_100g", "gordura_saturada"),
        ("trans-fat_100g", "gordura_trans"),
    ):
        valor = _numero(nutrientes.get(chave_off))
        if valor is not None:
            extras[chave] = round(valor, 2)
    sodio_g = _numero(nutrientes.get("sodium_100g"))
    if sodio_g is not None:
        extras["sodio"] = round(sodio_g * 1000, 1)  
    return extras


# Lê o tamanho da porção em gramas
def _porcao(produto: dict):
    gramas = produto.get("serving_quantity")
    try:
        gramas = float(gramas)
    except (TypeError, ValueError):
        return None, None
    if gramas <= 0 or gramas > 2000:
        return None, None
    descricao = (produto.get("serving_size") or "").strip() or f"{gramas:g} g"
    return round(gramas, 1), descricao


# Lê o peso da embalagem em gramas
def _embalagem_g(produto: dict) -> Optional[float]:
    texto = str(produto.get("quantity") or "").strip().lower().replace(",", ".")
    achado = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(g|kg)", texto)
    if not achado:
        return None
    gramas = float(achado.group(1)) * (1000 if achado.group(2) == "kg" else 1)
    return round(gramas, 1) if 0 < gramas <= 5000 else None


# Busca produtos do Brasil no Open Food Facts
def buscar_industrializados(termo: str, limite: int) -> List[AlimentoBusca]:
    parametros = urllib.parse.urlencode(
        {
            "q": f'{termo} countries_tags:"en:brazil"',
            "page_size": limite * 3,
            "fields": "code,product_name,brands,nutriments,serving_size,serving_quantity,quantity",
            "langs": "pt",
        }
    )
    requisicao = urllib.request.Request(
        f"{URL_OPEN_FOOD_FACTS}?{parametros}", headers={"User-Agent": USER_AGENT}
    )
    with urllib.request.urlopen(requisicao, timeout=TIMEOUT_SEGUNDOS) as resposta:
        dados = json.load(resposta)

    # Descarta produtos incompletos, incoerentes e repetidos
    resultados: List[AlimentoBusca] = []
    ja_vistos = set()
    for produto in dados.get("hits", []):
        nutrientes = produto.get("nutriments") or {}
        kcal = _numero(nutrientes.get("energy-kcal_100g"))
        nome = (produto.get("product_name") or "").strip()
        if not nome or kcal is None:
            continue

        proteina = _numero(nutrientes.get("proteins_100g")) or 0
        carboidrato = _numero(nutrientes.get("carbohydrates_100g")) or 0
        gordura = _numero(nutrientes.get("fat_100g")) or 0
        if not _calorias_coerentes(kcal, proteina, carboidrato, gordura):
            continue

        marcas = produto.get("brands")
        marca = marcas[0].strip() if isinstance(marcas, list) and marcas else None

        chave = (normalizar(nome), normalizar(marca or ""))
        if chave in ja_vistos:
            continue
        ja_vistos.add(chave)

        porcao_g, porcao_descricao = _porcao(produto)

        resultados.append(
            AlimentoBusca(
                id=str(produto.get("code")),
                nome=nome,
                categoria=marca,
                fonte="OPEN_FOOD_FACTS",
                kcal_100g=round(kcal, 1),
                proteina_100g=round(proteina, 1),
                carboidrato_100g=round(carboidrato, 1),
                gordura_100g=round(gordura, 1),
                fibra_100g=round(_numero(nutrientes.get("fiber_100g")) or 0, 1),
                nutrientes=_nutrientes_extras(nutrientes),
                porcao_g=porcao_g,
                porcao_descricao=porcao_descricao,
                embalagem_g=_embalagem_g(produto),
            )
        )
        if len(resultados) >= limite:
            break
    return resultados
