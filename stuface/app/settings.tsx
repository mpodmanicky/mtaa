import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { ENV } from '@/utils/env';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const styles = dynamicStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [chatNotificationsEnabled, setChatNotificationsEnabled] = useState(true);
  const [postNotificationsEnabled, setPostNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('John Doe');
  const [userId, setUserId] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Load user data and notification preferences
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load username and userId
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedPushToken = await AsyncStorage.getItem('pushToken');

        // Load notification preferences
        const storedNotificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
        const storedChatNotificationsEnabled = await AsyncStorage.getItem('chatNotificationsEnabled');
        const storedPostNotificationsEnabled = await AsyncStorage.getItem('postNotificationsEnabled');

        if (storedUsername) setUsername(storedUsername);
        if (storedUserId) setUserId(storedUserId);
        if (storedPushToken) setPushToken(storedPushToken);

        // Set notification preferences with fallback to true if not found
        setNotificationsEnabled(storedNotificationsEnabled !== 'false');
        setChatNotificationsEnabled(storedChatNotificationsEnabled !== 'false');
        setPostNotificationsEnabled(storedPostNotificationsEnabled !== 'false');
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };

    loadUserData();
  }, []);

  // Handle toggling main notifications
  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', value ? 'true' : 'false');

      if (value) {
        // Re-register for push notifications if they were turned on
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setPushToken(token.data);
          await AsyncStorage.setItem('pushToken', token.data);
        }
      }

      // Update server with new preferences
      await updateNotificationPreferences();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  // Handle toggling chat notifications
  const toggleChatNotifications = async (value: boolean) => {
    try {
      setChatNotificationsEnabled(value);
      await AsyncStorage.setItem('chatNotificationsEnabled', value ? 'true' : 'false');
      await updateNotificationPreferences();
    } catch (error) {
      console.error('Error toggling chat notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  // Handle toggling post notifications
  const togglePostNotifications = async (value: boolean) => {
    try {
      setPostNotificationsEnabled(value);
      await AsyncStorage.setItem('postNotificationsEnabled', value ? 'true' : 'false');
      await updateNotificationPreferences();
    } catch (error) {
      console.error('Error toggling post notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  // Update notification preferences on server
  const updateNotificationPreferences = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${ENV.API_URL}/users/${userId}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: notificationsEnabled,
          chat_enabled: chatNotificationsEnabled,
          post_enabled: postNotificationsEnabled,
          push_token: pushToken || undefined
        }),
      });

      if (!response.ok) {
        console.error('Failed to update notification preferences on server');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  return (
    <ImageBackground
      source={theme.colors.background}
      resizeMode="cover"
      style={styles.background}
    >
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={"white"} />
      </TouchableOpacity>

      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {/* Handle Change Password */}}
            >
              <Text style={styles.settingText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Notifications Section - Enhanced */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Notifications</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Enable All Notifications</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </View>

            {notificationsEnabled && (
              <>
                <View style={styles.settingItem}>
                  <Text style={styles.settingText}>Chat Messages</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={chatNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleChatNotifications}
                    value={chatNotificationsEnabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingText}>Post Activity</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={postNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={togglePostNotifications}
                    value={postNotificationsEnabled}
                  />
                </View>
              </>
            )}
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Dark Mode</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={"#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={theme.dark}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Support</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {/* Handle Support */}}
            >
              <Text style={styles.settingText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {/* Handle FAQ */}}
            >
              <Text style={styles.settingText}>FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>StuFace v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const dynamicStyles = (theme: any) => StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    paddingTop: StatusBar.currentHeight || 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignSelf: 'center'
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5182FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  section: {
    marginBottom: 25,
    backgroundColor: theme.colors.primary || 'rgba(200, 200, 200, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.3)',
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    color: theme.colors.muted || '#888',
    fontSize: 14,
  },
});
