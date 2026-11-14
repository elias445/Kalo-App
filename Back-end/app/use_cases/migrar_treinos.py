from sqlalchemy import text
from sqlalchemy.orm import Session


# Atualiza a tabela de treinos planejados em bancos criados antes das novas colunas
def migrar_treinos_planejados(db: Session) -> None:
    db.execute(text("ALTER TABLE treinos_planejados ADD COLUMN IF NOT EXISTS exercicio_id UUID REFERENCES exercicios(id)"))
    db.execute(text("ALTER TABLE treinos_planejados ADD COLUMN IF NOT EXISTS repeticoes INTEGER NOT NULL DEFAULT 12"))
    db.execute(text("ALTER TABLE treinos_planejados ADD COLUMN IF NOT EXISTS carga_kg DOUBLE PRECISION NOT NULL DEFAULT 0"))

    tipo_series = db.execute(
        text(
            "SELECT data_type FROM information_schema.columns "
            "WHERE table_name = 'treinos_planejados' AND column_name = 'series_planejadas'"
        )
    ).scalar()
    if tipo_series != "integer":
        db.execute(
            text(
                "ALTER TABLE treinos_planejados ALTER COLUMN series_planejadas TYPE INTEGER "
                "USING COALESCE(NULLIF(regexp_replace(series_planejadas::text, '[^0-9]', '', 'g'), '')::integer, 3)"
            )
        )
        db.execute(text("ALTER TABLE treinos_planejados ALTER COLUMN series_planejadas SET DEFAULT 3"))
    db.commit()


# Adiciona em bancos antigos a coluna de dias de treino por semana do usuário
def migrar_usuarios(db: Session) -> None:
    db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS dias_treino INTEGER"))
    db.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS dias_preferidos VARCHAR"))
    db.commit()
