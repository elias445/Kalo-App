import uuid
from sqlalchemy.orm import Session
from app.models.preferencia_notificacao import PreferenciaNotificacaoModel
from app.schemas.preferencia_notificacao import PreferenciaNotificacaoUpsert


# Cria ou atualiza as preferências de notificação do usuário (upsert)
def atualizar_preferencias_notificacao(db: Session, dados: PreferenciaNotificacaoUpsert) -> PreferenciaNotificacaoModel:
    preferencia = db.query(PreferenciaNotificacaoModel).filter(
        PreferenciaNotificacaoModel.usuario_id == dados.usuario_id
    ).first()

    if preferencia:
        # Atualiza os campos existentes
        for campo, valor in dados.model_dump(exclude={"usuario_id"}).items():
            setattr(preferencia, campo, valor)
    else:
        # Cria o registro pela primeira vez
        preferencia = PreferenciaNotificacaoModel(id=uuid.uuid4(), **dados.model_dump())
        db.add(preferencia)

    db.commit()
    db.refresh(preferencia)
    return preferencia
