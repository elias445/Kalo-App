from app.models.usuario import UsuarioModel
from app.security import criar_token_acesso


# Monta os dados do usuário enviados ao app
def dados_do_usuario(usuario: UsuarioModel) -> dict:
    # Onboarding completo = todos esses campos preenchidos
    campos_do_onboarding = [usuario.sexo, usuario.idade, usuario.altura, usuario.peso_atual, usuario.objetivo]
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "usuario": usuario.usuario,
        "codigo_convite": usuario.codigo_convite,
        "sexo": usuario.sexo,
        "idade": usuario.idade,
        "altura": usuario.altura,
        "peso_atual": usuario.peso_atual,
        "objetivo": usuario.objetivo,
        "nivel_experiencia": usuario.nivel_experiencia,
        "dias_treino": usuario.dias_treino,
        "dias_preferidos": usuario.dias_preferidos.split(",") if usuario.dias_preferidos else None,
        "onboarding_completo": all(campo is not None for campo in campos_do_onboarding),
    }


# Gera o token e devolve junto com os dados do usuário
def iniciar_sessao(usuario: UsuarioModel) -> dict:
    return {
        "token": criar_token_acesso({"sub": str(usuario.id)}),
        "usuario": dados_do_usuario(usuario),
    }
