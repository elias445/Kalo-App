import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  await Notifications.cancelAllScheduledNotificationsAsync();

  await agendarRefeicao('Café da Manhã', 8, 0, 'Já tomou seu café? Anote o que consumiu! ☕');
  await agendarRefeicao('Almoço', 12, 30, 'Hora do almoço! Não esqueça de registrar no diário. 🥗');
  await agendarRefeicao('Jantar', 1, 25, 'O que tivemos para o jantar? Mantenha o foco! 🍽️'); // Corrigido o 01 para 1
}

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
    },
  });
}