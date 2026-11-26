import uuid
from sqlalchemy.orm import Session
from app.models.preferencia_notificacao import PreferenciaNotificacaoModel


# Busca as preferências do usuário; se não existir, cria e salva com os valores padrão
def obter_preferencias_notificacao(db: Session, usuario_id) -> PreferenciaNotificacaoModel:
    preferencia = db.query(PreferenciaNotificacaoModel).filter(
        PreferenciaNotificacaoModel.usuario_id == usuario_id
    ).first()

    if not preferencia:
        preferencia = PreferenciaNotificacaoModel(
            id=uuid.uuid4(),
            usuario_id=usuario_id,
            cafe_ativo=True,
            cafe_hora=8,
            cafe_minuto=0,
            lanche_manha_ativo=True,
            lanche_manha_hora=10,
            lanche_manha_minuto=30,
            almoco_ativo=True,
            almoco_hora=12,
            almoco_minuto=30,
            lanche_tarde_ativo=True,
            lanche_tarde_hora=16,
            lanche_tarde_minuto=0,
            jantar_ativo=True,
            jantar_hora=19,
            jantar_minuto=30,
            ceia_ativo=True,
            ceia_hora=22,
            ceia_minuto=0,
        )
        db.add(preferencia)
        db.commit()
        db.refresh(preferencia)

    return preferencia
