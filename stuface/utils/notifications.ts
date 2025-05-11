import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to check if app is in foreground using AsyncStorage
// This is a simplification - normally you'd use AppState
export const setAppInBackground = async () => {
  await AsyncStorage.setItem('appState', 'background');
};

export const setAppInForeground = async () => {
  await AsyncStorage.setItem('appState', 'foreground');
};

export const getAppState = async () => {
  return await AsyncStorage.getItem('appState') || 'foreground';
};

// Show a local notification for a chat message
export const showMessageNotification = async (
  senderName: string,
  messageText: string,
  conversationId: string,
  senderId: string
) => {
  try {
    // Only show notifications when app is in background (simulated)
    const appState = await getAppState();
    if (appState === 'foreground') {
      console.log('App in foreground, not showing notification');
      return;
    }

    // Check if notifications are enabled
    const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
    const chatNotificationsEnabled = await AsyncStorage.getItem('chatNotificationsEnabled');

    if (notificationsEnabled === 'false' || chatNotificationsEnabled === 'false') {
      console.log('Notifications disabled in settings');
      return;
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText,
        data: {
          type: 'chat',
          conversationId,
          senderId,
          senderName
        },
      },
      trigger: null, // null means show immediately
    });

    console.log('Local notification shown for message from', senderName);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Test notification function
export const showTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test message notification',
        data: { type: 'test' },
      },
      trigger: null,
    });
    console.log('Test notification shown');
  } catch (error) {
    console.error('Error showing test notification:', error);
  }
};

// Setup notification response handler
export const setupNotificationTapHandler = (navigationCallback: any) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification tapped:', data);

    if (data.type === 'chat') {
      navigationCallback({
        screen: '/messages',
        params: {
          conversationId: data.conversationId,
          username: data.senderName,
        }
      });
    }
  });

  return () => subscription.remove();
};
