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
} from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { theme, toggleTheme, toggleHighContrast, isHighContrast } = useTheme();
  const router = useRouter();
  const styles = dynamicStyles(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('John Doe'); // Example username

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
      } catch (e) {
        console.log('Error loading settings:', e);
      }
    };

    loadSettings();
  }, []);

  // Handle notification toggle
  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value ? 'true' : 'false');
    } catch (e) {
      console.log('Error saving notification setting:', e);
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
});
