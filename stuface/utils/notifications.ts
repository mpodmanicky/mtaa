import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure how notifications appear to the user
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Check and request notifications permissions
export async function checkNotificationsPermissions() {
  // Check if notification settings is enabled in app
  const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
  if (notificationsEnabled === 'false') {
    console.log('Notifications are disabled in app settings');
    return false;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If not already granted, request permission
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  return true;
}

// Request notification permissions with proper UI flow
export async function requestNotificationPermissions() {
  try {
    // Check if we've already asked for permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    // Return early if permissions are already granted
    if (existingStatus === 'granted') {
      console.log('Notification permissions already granted');
      return true;
    }

    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      console.log('Notification permissions granted');
      return true;
    } else {
      console.log('Notification permissions denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Get current permission status
export async function getNotificationPermissionStatus() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return 'error';
  }
}

// Simulate app being in background
let isAppInBackground = false;

export const setAppInBackground = () => {
  isAppInBackground = true;
  AsyncStorage.setItem('appState', 'background');
};

export const setAppInForeground = () => {
  isAppInBackground = false;
  AsyncStorage.setItem('appState', 'foreground');
};

export const getAppState = async () => {
  return await AsyncStorage.getItem('appState') || 'foreground';
};

// Schedule a notification for a new message
export async function showMessageNotification(
  senderName: string,
  messageText: string,
  conversationId: string
) {
  try {
    // Check if notifications are enabled
    const hasPermission = await checkNotificationsPermissions();
    if (!hasPermission) return;

    // Only show notifications when the app is in background
    const appState = await getAppState();
    if (appState !== 'background' && !isAppInBackground) {
      console.log('App in foreground, not showing notification');
      return;
    }

    // Send the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: messageText.length > 100 ? `${messageText.substring(0, 97)}...` : messageText,
        data: {
          type: 'message',
          conversationId,
          senderName
        },
        sound: true, // Use default sound
      },
      trigger: null, // null means show immediately
    });

    console.log('Local notification shown for message from', senderName);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Setup notification response handler
export function setupNotificationResponseHandler(navigationCallback: any) {
  // When user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);

      if (data.type === 'message') {
        navigationCallback({
          screen: '/messages',
          params: {
            conversationId: data.conversationId,
            username: data.senderName
          }
        });
      }
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(responseSubscription);
  };
}

// Create Android notification channels
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3872E9',
      sound: true,
    });
  }
}

// Show a test notification
export async function showTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Message',
      body: 'This is a test notification. Tap to open the app.',
      data: { type: 'test' },
    },
    trigger: null,
  });
}
