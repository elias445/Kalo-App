from app.models.usuario import UsuarioModel
from app.security import criar_token_acesso


def dados_do_usuario(usuario: UsuarioModel) -> dict:
    campos_do_onboarding = [usuario.sexo, usuario.idade, usuario.altura, usuario.peso_atual, usuario.objetivo]
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "sexo": usuario.sexo,
        "idade": usuario.idade,
        "altura": usuario.altura,
        "peso_atual": usuario.peso_atual,
        "objetivo": usuario.objetivo,
        "onboarding_completo": all(campo is not None for campo in campos_do_onboarding),
    }


def iniciar_sessao(usuario: UsuarioModel) -> dict:
    return {
        "token": criar_token_acesso({"sub": str(usuario.id)}),
        "usuario": dados_do_usuario(usuario),
    }
