import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiFetch } from './api';

// Define como a notificação aparece com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

  // Tipo que espelha as preferências vindas da API
  export type PreferenciasNotificacao = {
    cafe_ativo: boolean; cafe_hora: number; cafe_minuto: number;
    lanche_manha_ativo: boolean; lanche_manha_hora: number; lanche_manha_minuto: number;
    almoco_ativo: boolean; almoco_hora: number; almoco_minuto: number;
    lanche_tarde_ativo: boolean; lanche_tarde_hora: number; lanche_tarde_minuto: number;
    jantar_ativo: boolean; jantar_hora: number; jantar_minuto: number;
    ceia_ativo: boolean; ceia_hora: number; ceia_minuto: number;
  };

  // Preferências padrão usadas quando o usuário nunca configurou
  export const PREFERENCIAS_PADRAO: PreferenciasNotificacao = {
    cafe_ativo: true, cafe_hora: 8, cafe_minuto: 0,
    lanche_manha_ativo: true, lanche_manha_hora: 10, lanche_manha_minuto: 30,
    almoco_ativo: true, almoco_hora: 12, almoco_minuto: 30,
    lanche_tarde_ativo: true, lanche_tarde_hora: 16, lanche_tarde_minuto: 0,
    jantar_ativo: true, jantar_hora: 19, jantar_minuto: 30,
    ceia_ativo: true, ceia_hora: 22, ceia_minuto: 0,
  };

  // Pede permissão e agenda os lembretes dinamicamente com base nas preferências do usuário
  export async function configurarLembretesDiarios(usuarioId?: string) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;


    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Lembretes de Refeição',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00D1FF',
      });
    }

    // Remove agendamentos antigos para não duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Carrega as preferências do servidor se tiver usuário logado; senão usa os padrões
    let prefs: PreferenciasNotificacao = PREFERENCIAS_PADRAO;
    if (usuarioId) {
      try {
        const dados = await apiFetch(`/notificacoes/${usuarioId}`);
        if (dados) prefs = dados as PreferenciasNotificacao;
      } catch {
        // Silencia: usa os padrões se a requisição falhar
      }
    }

    if (prefs.cafe_ativo)
      await agendarRefeicao('Café da Manhã', prefs.cafe_hora, prefs.cafe_minuto, 'Já tomou seu café? Anote o que consumiu! ☕');
    if (prefs.lanche_manha_ativo)
      await agendarRefeicao('Lanche da Manhã', prefs.lanche_manha_hora, prefs.lanche_manha_minuto, 'Pausa para um lanche leve! Mantenha a energia. 🍎');
    if (prefs.almoco_ativo)
      await agendarRefeicao('Almoço', prefs.almoco_hora, prefs.almoco_minuto, 'Hora do almoço! Não esqueça de registrar no diário. 🥗');
    if (prefs.lanche_tarde_ativo)
      await agendarRefeicao('Lanche da Tarde', prefs.lanche_tarde_hora, prefs.lanche_tarde_minuto, 'Hora do lanche da tarde! O que temos para agora? 🥪');
    if (prefs.jantar_ativo)
      await agendarRefeicao('Jantar', prefs.jantar_hora, prefs.jantar_minuto, 'O que tivemos para o jantar? Mantenha o foco! 🍽️');
    if (prefs.ceia_ativo)
      await agendarRefeicao('Ceia', prefs.ceia_hora, prefs.ceia_minuto, 'Última refeição do dia. Hora de relaxar! 🥛');
  }

  // Agenda uma notificação que se repete todo dia no horário
  async function agendarRefeicao(titulo: string, hora: number, minuto: number, corpo: string) {
    await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo, sound: true },
    trigger: { hour: hora, minute: minuto, repeats: true, channelId: 'default' },
  });
}

// Mostra na hora uma notificação da comunidade (convite novo), se o usuário permitiu notificações
export async function avisarComunidade(titulo: string, corpo: string) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo, sound: true },
      trigger: Platform.OS === 'android' ? { channelId: 'default' } : null,
    });
  } catch (erro) {
    console.error('Erro ao mostrar a notificação da comunidade:', erro);
  }
}

// Lista as notificações que estão na bandeja do celular
export async function checarNotificacoesNaTela() {
  const notificacoesAtivas = await Notifications.getPresentedNotificationsAsync();
  return notificacoesAtivas;
}
