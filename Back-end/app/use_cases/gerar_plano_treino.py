from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.treino_planejado import TreinoPlanejado
from app.models.usuario import UsuarioModel
from app.use_cases.buscar_exercicios import buscar_exercicios
from app.use_cases.exigir_usuario import exigir_usuario
from app.use_cases.listar_plano_treino import listar_plano_treino

# Termos de busca de cada grupo muscular, do exercício mais importante para o menos
TERMOS: Dict[str, List[str]] = {
    "Peito": ["supino reto", "supino inclinado", "crucifixo", "flexão", "crossover", "pullover"],
    "Tríceps": ["tríceps testa", "tríceps", "polia", "mergulho", "extensão de tríceps", "coice"],
    "Costas": ["puxada", "remada baixa", "remada curvada", "remada unilateral", "barra fixa", "pulldown"],
    "Bíceps": ["rosca direta", "martelo", "rosca alternada", "rosca concentrada", "rosca scott", "rosca"],
    "Pernas": ["agachamento", "leg press", "extensora", "flexora", "afundo", "stiff"],
    "Panturrilha": ["panturrilha"],
    "Ombros": ["arnold", "elevação lateral", "elevação frontal", "remada alta", "crucifixo inverso", "desenvolvimento"],
    "Abdômen": ["abdominal", "prancha", "elevação de pernas", "bicicleta", "roda abdominal", "lateral"],
    "Cardio": ["", "bicicleta", "polichinelo", "salto", "corrida", "corda"],
}

# Sessões de treino: lista de (grupo, posição na lista de termos), da mais importante para a menos
SESSOES: Dict[str, List[Tuple[str, int]]] = {
    "Peito e Tríceps": [("Peito", 0), ("Peito", 1), ("Tríceps", 0), ("Peito", 2), ("Tríceps", 1), ("Peito", 3), ("Tríceps", 2)],
    "Costas e Bíceps": [("Costas", 0), ("Costas", 1), ("Bíceps", 0), ("Costas", 2), ("Bíceps", 1), ("Costas", 3), ("Bíceps", 2)],
    "Pernas": [("Pernas", 0), ("Pernas", 1), ("Pernas", 2), ("Pernas", 3), ("Panturrilha", 0), ("Pernas", 4), ("Pernas", 5)],
    "Ombros e Abdômen": [("Ombros", 0), ("Ombros", 1), ("Abdômen", 0), ("Ombros", 2), ("Abdômen", 1), ("Ombros", 3), ("Abdômen", 2)],
    "Empurrar": [("Peito", 0), ("Ombros", 0), ("Peito", 1), ("Tríceps", 0), ("Ombros", 1), ("Peito", 2), ("Tríceps", 1)],
    "Pernas e Abdômen": [("Pernas", 0), ("Pernas", 1), ("Pernas", 2), ("Abdômen", 0), ("Panturrilha", 0), ("Pernas", 3), ("Abdômen", 1)],
    "Cardio e Abdômen": [("Cardio", 0), ("Abdômen", 1), ("Cardio", 1), ("Abdômen", 0), ("Cardio", 2), ("Abdômen", 2), ("Cardio", 3)],
    "Corpo inteiro A": [("Pernas", 0), ("Peito", 0), ("Costas", 0), ("Ombros", 0), ("Bíceps", 0), ("Tríceps", 0), ("Abdômen", 0)],
    "Corpo inteiro B": [("Pernas", 1), ("Peito", 1), ("Costas", 1), ("Ombros", 1), ("Bíceps", 1), ("Tríceps", 1), ("Abdômen", 1)],
}

# Sessões de cada divisão semanal, na ordem em que aparecem: (sessão, variante). A variante 1 troca os exercícios
SEQUENCIAS: Dict[int, List[Tuple[str, int]]] = {
    2: [("Corpo inteiro A", 0), ("Corpo inteiro B", 0)],
    3: [("Empurrar", 0), ("Costas e Bíceps", 0), ("Pernas e Abdômen", 0)],
    4: [("Peito e Tríceps", 0), ("Costas e Bíceps", 0), ("Pernas", 0), ("Ombros e Abdômen", 0)],
    5: [("Peito e Tríceps", 0), ("Costas e Bíceps", 0), ("Pernas", 0), ("Ombros e Abdômen", 0), ("Cardio e Abdômen", 0)],
    6: [
        ("Empurrar", 0),
        ("Costas e Bíceps", 0),
        ("Pernas e Abdômen", 0),
        ("Empurrar", 1),
        ("Costas e Bíceps", 1),
        ("Pernas e Abdômen", 1),
    ],
}

# Dias da semana, começando na segunda-feira
SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

# Dias usados quando o usuário só informou quantos dias quer treinar
DIAS_PADRAO: Dict[int, List[str]] = {
    2: ["Seg", "Qui"],
    3: ["Seg", "Qua", "Sex"],
    4: ["Seg", "Ter", "Qui", "Sex"],
    5: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    6: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
}


# Dias da semana em que o usuário vai treinar (os escolhidos por ele ou, se não escolheu, os padrão)
def _dias_do_usuario(usuario: UsuarioModel) -> List[str]:
    escolhidos = [d for d in (usuario.dias_preferidos or "").split(",") if d in SEMANA]
    if 2 <= len(set(escolhidos)) <= 6:
        return sorted(set(escolhidos), key=SEMANA.index)
    return DIAS_PADRAO.get(usuario.dias_treino or 0, DIAS_PADRAO[5])


# Ajuste por objetivo: (repetições, séries a mais, inclui cardio no fim do treino, exercícios a menos)
OBJETIVOS: Dict[str, Tuple[int, int, bool, int]] = {
    "Emagrecimento": (15, 0, True, 0),
    "Hipertrofia e Ganho de Massa": (10, 1, False, 0),
    "Definição Muscular": (12, 0, True, 0),
    "Manutenção e Saúde": (12, 0, False, 0),
    "Performance Esportiva": (8, 1, True, 0),
    "Bem-estar e Saúde Mental": (12, 0, False, 1),
}

# Exercícios por treino e séries base de cada nível
NIVEIS: Dict[str, Tuple[int, int]] = {"Iniciante": (4, 3), "Intermediário": (5, 3), "Avançado": (6, 4)}


# Séries, repetições, quantidade de exercícios e cardio, conforme o objetivo e o nível do usuário
def _parametros(objetivo: Optional[str], nivel: Optional[str]):
    quantidade, series = NIVEIS.get(nivel or "", NIVEIS["Intermediário"])
    repeticoes, mais_series, cardio, menos = OBJETIVOS.get(objetivo or "", OBJETIVOS["Manutenção e Saúde"])
    return {
        "series": min(series + mais_series, 5),
        "repeticoes": repeticoes,
        "quantidade": max(quantidade - menos, 3),
        "cardio": cardio,
    }


# Escolhe o exercício do grupo que combina com o termo e ainda não foi usado no dia
def _escolher(db: Session, grupo: str, termo: str, usados: set):
    for busca in (termo, ""):
        for candidato in buscar_exercicios(db, busca or None, grupo, 15):
            if candidato.id not in usados:
                return candidato
    return None


# Monta o treino de um dia: (grupo, exercício, séries, repetições) na ordem de execução
def _montar_dia(db: Session, sessao: str, variante: int, parametros: dict, indice_dia: int):
    usados: set = set()
    treino = []
    receita = SESSOES[sessao][: parametros["quantidade"]]
    if parametros["cardio"] and not sessao.startswith("Cardio"):
        receita = receita + [("Cardio", indice_dia)]

    for grupo, posicao in receita:
        termos = TERMOS[grupo]
        termo = termos[(posicao + variante) % len(termos)]
        exercicio = _escolher(db, grupo, termo, usados)
        if exercicio is None:
            continue
        usados.add(exercicio.id)
        leve = grupo in ("Abdômen", "Cardio")
        treino.append((exercicio, 3 if leve else parametros["series"], 20 if leve else parametros["repeticoes"]))
    return treino


# Gera o plano do usuário a partir do objetivo, do nível e dos dias de treino por semana.
# Se ele já tem plano, devolve o existente (a menos que substituir=True)
def gerar_plano_treino(db: Session, usuario_id, substituir: bool = False):
    exigir_usuario(db, usuario_id)
    existentes = db.query(TreinoPlanejado).filter(TreinoPlanejado.usuario_id == usuario_id)
    if existentes.first() is not None:
        if not substituir:
            return listar_plano_treino(db, usuario_id)
        existentes.delete(synchronize_session=False)
        db.flush()

    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    dias = _dias_do_usuario(usuario)
    parametros = _parametros(usuario.objetivo, usuario.nivel_experiencia)

    for indice, (dia, (sessao, variante)) in enumerate(zip(dias, SEQUENCIAS[len(dias)])):
        for ordem, (exercicio, series, repeticoes) in enumerate(_montar_dia(db, sessao, variante, parametros, indice), start=1):
            db.add(
                TreinoPlanejado(
                    usuario_id=usuario_id,
                    exercicio_id=exercicio.id,
                    dia_semana=dia,
                    grupo_muscular=exercicio.grupo,
                    nome_exercicio=exercicio.nome,
                    wger_exercicio_id=exercicio.wger_id,
                    series_planejadas=series,
                    repeticoes=repeticoes,
                    carga_kg=0,
                    ordem=ordem,
                )
            )
    db.commit()
    return listar_plano_treino(db, usuario_id)
