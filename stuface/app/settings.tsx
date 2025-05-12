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
import {
  requestNotificationPermissions,
  getNotificationPermissionStatus,
  showTestNotification
} from '@/utils/notifications';

export default function SettingsScreen() {
  const { theme, toggleTheme, toggleHighContrast, isHighContrast } = useTheme();
  const router = useRouter();
  const styles = dynamicStyles(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('John Doe'); // Example username
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load username
        const value = await AsyncStorage.getItem('username');
        if (value !== null) {
          setUsername(value);
        }

        // Load notification settings
        const notificationSetting = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(notificationSetting !== 'false');

        // Check and update permission status
        const status = await getNotificationPermissionStatus();
        setPermissionStatus(status);
      } catch (e) {
        console.log('Error loading settings:', e);
      }
    };

    loadSettings();
  }, []);

  // Handle notification toggle
  const handleNotificationsToggle = async (value: boolean) => {
    // If turning ON notifications
    if (value) {
      // Check current permission status
      const status = await getNotificationPermissionStatus();

      // If permission not granted, request it
      if (status !== 'granted') {
        // Show explanation dialog
        Alert.alert(
          "Enable Notifications",
          "StuFace would like to send you notifications for new messages and activity on your posts.",
          [
            {
              text: "Not Now",
              style: "cancel",
              onPress: () => {
                // Keep toggle off if user cancels
                setNotificationsEnabled(false);
                AsyncStorage.setItem('notificationsEnabled', 'false');
              }
            },
            {
              text: "Allow",
              onPress: async () => {
                // Request system permission
                const granted = await requestNotificationPermissions();

                // Update permission status
                const newStatus = await getNotificationPermissionStatus();
                setPermissionStatus(newStatus);

                if (granted) {
                  // If granted, turn on notifications
                  setNotificationsEnabled(true);
                  await AsyncStorage.setItem('notificationsEnabled', 'true');

                  // Show success message
                  setTimeout(() => {
                    Alert.alert(
                      "Notifications Enabled",
                      "You will now receive notifications for new messages and activity.",
                      [
                        {
                          text: "Test Notification",
                          onPress: showTestNotification
                        },
                        {
                          text: "OK"
                        }
                      ]
                    );
                  }, 500);
                } else {
                  // If denied, keep toggle off
                  setNotificationsEnabled(false);
                  await AsyncStorage.setItem('notificationsEnabled', 'false');

                  // Show instructions for settings
                  setTimeout(() => {
                    Alert.alert(
                      "Permission Required",
                      "Please enable notifications for StuFace in your device settings to receive notifications.",
                      [{ text: "OK" }]
                    );
                  }, 500);
                }
              }
            }
          ]
        );
        return; // Exit early - don't update state until after permission flow
      }

      // If we already have permission, just turn it on
      setNotificationsEnabled(true);
      await AsyncStorage.setItem('notificationsEnabled', 'true');
    } else {
      // If turning OFF notifications, just update the setting
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notificationsEnabled', 'false');
    }
  };

  // Add a function to test notifications
  const testNotification = async () => {
    if (!notificationsEnabled || permissionStatus !== 'granted') {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications first to test this feature.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await showTestNotification();
      Alert.alert(
        "Test Notification Sent",
        "If you don't see the notification, please check your device settings.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert("Error", "Failed to send test notification");
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
              onPress={() => {
                router.push({pathname: '/password'});
              }}
            >
              <Text style={styles.settingText}>Change Password</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Notifications</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleNotificationsToggle}
                value={notificationsEnabled}
              />
            </View>

            {/* Add this informational block about permissions
            {notificationsEnabled && permissionStatus !== 'granted' && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Notifications are enabled in the app, but system permission is not granted.
                  You won't receive notifications until permission is granted in your device settings.
                </Text>
              </View>
            )} */}

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Dark Mode</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={theme.dark ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={theme.dark}
              />
            </View>
          </View>

          {/* Accessibility Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Accessibility</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>High Contrast</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isHighContrast ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleHighContrast}
                value={isHighContrast}
              />
            </View>

            {isHighContrast && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  High contrast mode increases readability by using colors with greater contrast.
                </Text>
              </View>
            )}
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
    backgroundColor: theme.colors.back,
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
    color: theme.colors.text,
    opacity: 0.6,
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: theme.highContrast ? theme.colors.secondary : 'rgba(100, 100, 100, 0.2)',
    borderRadius: 8,
    padding: 12,
    margin: 15,
    marginTop: 0,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    margin: 15,
    marginTop: 0,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  warningText: {
    color: theme.colors.text,
    fontSize: 14,
  },
});
