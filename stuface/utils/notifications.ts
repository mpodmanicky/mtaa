import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification:  async () => {
    const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');

    return {
      shouldShowAlert: notificationsEnabled !== 'false',
      shouldPlaySound: notificationsEnabled !== 'false',
      shouldSetBadge: notificationsEnabled !== 'false',
    };
  }
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  // Check if device is physical (notifications don't work in emulators)
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Using a development build is recommended.');
    // Return a mock token for testing in Expo Go
    return { data: 'expo-go-mock-token-' + Date.now() };
  }

  // Check if notifications are enabled in app settings
  const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
  if (notificationsEnabled === 'false') {
    console.log('Notifications are disabled in app settings');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Exit if no permission
    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permission');
      return null;
    }

    // Get Expo push token
    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id-here',
      });

      console.log('Push token:', token.data);
    } catch (error) {
      console.error('Error getting push token:', error);
      // Return a mock token if we can't get a real one
      token = { data: 'mock-token-' + Date.now() };
      console.log('Using mock token:', token.data);
    }

    // Store token locally
    await AsyncStorage.setItem('pushToken', token.data);

    // Register device token on server
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      try {
        const response = await fetch(`${ENV.API_URL}/users/${userId}/device`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_token: token.data,
            platform: Platform.OS,
          }),
        });

        if (!response.ok) {
          console.error('Failed to register device token with server');
        }
      } catch (serverError) {
        console.error('Error communicating with server:', serverError);
      }
    }

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0066FF',
      });

      Notifications.setNotificationChannelAsync('chat', {
        name: 'Chat Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#FF5252',
      });

      Notifications.setNotificationChannelAsync('posts', {
        name: 'Post Activity',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 50, 50, 50],
        lightColor: '#2196F3',
      });
    }

    return token;
  } catch (error) {
    console.error('Error setting up push notifications:', error);
    return null;
  }
}

// Set up notification response listeners
export function setupNotificationListeners(navigationCallback:any) {
  // When notification received while app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received in foreground:', notification);
    }
  );

  // When user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);

      // Handle navigation based on notification type
      if (data && navigationCallback) {
        if (data.type === 'chat' && data.senderId) {
          navigationCallback({
            screen: '/messages',
            params: { userId: data.senderId, username: data.senderName }
          });
        } else if (data.type === 'comment' && data.postId) {
          navigationCallback({
            screen: '/topics/comments',
            params: {
              postId: data.postId,
              username: data.postUsername,
              hasImage: data.hasImage,
              location: data.location
            }
          });
        } else if (data.type === 'like' && data.postId) {
          navigationCallback({
            screen: '/topics/topic',
            params: { id: data.topicId, name: data.topicName }
          });
        }
      }
    }
  );

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(foregroundSubscription);
    Notifications.removeNotificationSubscription(responseSubscription);
  };
}

// Send a test notification (for development)
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "This is a test notification from StuFace",
      data: { type: 'test' },
    },
    trigger: null, // Send immediately
  });
}
