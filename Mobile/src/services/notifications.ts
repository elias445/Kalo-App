import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Define como a notificação aparece com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pede permissão e agenda um lembrete para cada refeição
export async function configurarLembretesDiarios() {
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

  await agendarRefeicao('Café da Manhã', 8, 0, 'Já tomou seu café? Anote o que consumiu! ☕');
  await agendarRefeicao('Lanche da Manhã', 10, 30, 'Pausa para um lanche leve! Mantenha a energia. 🍎');
  await agendarRefeicao('Almoço', 12, 30, 'Hora do almoço! Não esqueça de registrar no diário. 🥗');
  await agendarRefeicao('Lanche da Tarde', 16, 0, 'Hora do lanche da tarde! O que temos para agora? 🥪');
  await agendarRefeicao('Jantar', 19, 30, 'O que tivemos para o jantar? Mantenha o foco! 🍽️'); 
  await agendarRefeicao('Ceia', 22, 0, 'Última refeição do dia. Hora de relaxar! 🥛');
}

// Agenda uma notificação que se repete todo dia no horário
async function agendarRefeicao(titulo: string, hora: number, minuto: number, corpo: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      sound: true,
    },
    trigger: {
      hour: hora,
      minute: minuto,
      repeats: true,
      channelId: 'default'
    },});
}
// Lista as notificações que estão na bandeja do celular
export async function checarNotificacoesNaTela() {
  const notificacoesAtivas = await Notifications.getPresentedNotificationsAsync();
  return notificacoesAtivas;
}