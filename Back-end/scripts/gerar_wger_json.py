import html
import json
import re
import subprocess
from pathlib import Path

URL_WGER = "https://wger.de/api/v2"
SAIDA = Path(__file__).resolve().parent.parent / "app" / "data" / "wger.json"
IDIOMA_PT = 7
IDIOMA_EN = 2

CATEGORIAS = {
    "Abs": "Abdômen",
    "Arms": "Braços",
    "Back": "Costas",
    "Calves": "Panturrilha",
    "Cardio": "Cardio",
    "Chest": "Peito",
    "Legs": "Pernas",
    "Shoulders": "Ombros",
}

MUSCULOS = {
    1: "Bíceps",
    2: "Ombros",
    3: "Serrátil anterior",
    4: "Peitoral",
    5: "Tríceps",
    6: "Abdômen",
    7: "Panturrilha",
    8: "Glúteos",
    9: "Trapézio",
    10: "Quadríceps",
    11: "Posterior da coxa",
    12: "Dorsais",
    13: "Braquial",
    14: "Oblíquos",
    15: "Sóleo",
}

EQUIPAMENTOS = {
    "Barbell": "Barra",
    "SZ-Bar": "Barra W",
    "Dumbbell": "Halteres",
    "Gym mat": "Colchonete",
    "Swiss Ball": "Bola suíça",
    "Pull-up bar": "Barra fixa",
    "none (bodyweight exercise)": "Peso corporal",
    "Bench": "Banco",
    "Incline bench": "Banco inclinado",
    "Kettlebell": "Kettlebell",
    "Cable machine": "Polia",
    "Resistance band": "Elástico",
}


def buscar_json(url: str) -> dict:
    # Usa o curl porque o Python do Windows pode rejeitar a cadeia de certificados do wger
    resultado = subprocess.run(
        ["curl", "-s", "-m", "90", "-H", "Accept: application/json", url],
        capture_output=True,
        check=True,
    )
    return json.loads(resultado.stdout.decode("utf-8"))


def texto_simples(descricao_html: str) -> str:
    texto = descricao_html.replace("</li>", "\n").replace("<li>", "• ").replace("</p>", "\n")
    texto = re.sub(r"<[^>]+>", "", texto)
    texto = html.unescape(texto)
    linhas = [linha.strip() for linha in texto.splitlines()]
    return "\n".join(linha for linha in linhas if linha)


def traduzir_equipamento(nome: str) -> str:
    return EQUIPAMENTOS.get(nome, nome)


def definir_grupo(categoria: str, ids_musculos: list) -> str:
    if categoria != "Arms":
        return CATEGORIAS.get(categoria, categoria)
    if 5 in ids_musculos:
        return "Tríceps"
    if 1 in ids_musculos or 13 in ids_musculos:
        return "Bíceps"
    return "Braços"


def converter(exercicio: dict):
    traducoes = {t["language"]: t for t in exercicio["translations"]}
    escolhida = traducoes.get(IDIOMA_PT) or traducoes.get(IDIOMA_EN)
    if not escolhida or not escolhida["name"].strip():
        return None

    ids_principais = [m["id"] for m in exercicio["muscles"]]
    ids_secundarios = [m["id"] for m in exercicio["muscles_secondary"]]
    categoria = exercicio["category"]["name"]
    imagens = sorted(exercicio["images"], key=lambda i: not i.get("is_main", False))

    return {
        "wger_id": exercicio["id"],
        "nome": escolhida["name"].strip(),
        "nome_en": traducoes[IDIOMA_EN]["name"].strip() if IDIOMA_EN in traducoes else None,
        "idioma": "pt" if IDIOMA_PT in traducoes else "en",
        "categoria": CATEGORIAS.get(categoria, categoria),
        "grupo": definir_grupo(categoria, ids_principais),
        "musculos": [MUSCULOS[i] for i in ids_principais if i in MUSCULOS],
        "musculos_secundarios": [MUSCULOS[i] for i in ids_secundarios if i in MUSCULOS],
        "equipamento": [traduzir_equipamento(e["name"]) for e in exercicio["equipment"]],
        "descricao": texto_simples(escolhida.get("description") or ""),
        "imagem_url": imagens[0]["image"] if imagens else None,
    }


def main():
    exercicios = []
    url = f"{URL_WGER}/exerciseinfo/?limit=100&offset=0"
    while url:
        pagina = buscar_json(url)
        exercicios.extend(pagina["results"])
        url = pagina["next"]
        print(f"{len(exercicios)} de {pagina['count']} exercícios baixados")

    convertidos = [c for c in (converter(e) for e in exercicios) if c]
    convertidos.sort(key=lambda c: c["wger_id"])

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as arquivo:
        json.dump(convertidos, arquivo, ensure_ascii=False, indent=1)

    com_pt = sum(1 for c in convertidos if c["idioma"] == "pt")
    com_imagem = sum(1 for c in convertidos if c["imagem_url"])
    print(f"{len(convertidos)} exercícios salvos em {SAIDA}")
    print(f"{com_pt} com nome em português, {com_imagem} com imagem")


if __name__ == "__main__":
    main()
