import { ThemeProvider } from "@/context/ThemeContex";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { Stack, Tabs, usePathname, useRouter } from "expo-router"; // Added useRouter
import AsyncStorage from "@react-native-async-storage/async-storage"; // Added for auth check
import CustomTabBar from "@/components/CustomTabBar";
import { ENV } from "@/utils/env"; // Import our environment configuration
import {
  setupNotificationResponseHandler,
  setupNotificationChannels
} from '@/utils/notifications'; // Changed to localNotifications

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter(); // Added router
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Added auth state
  const isAuthScreen = pathname === '/login' || pathname === '/register' || pathname === '/';
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        setIsAuthenticated(!!token && !!userId);
      } catch (error) {
        console.error('Error checking authentication status', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]);

  useEffect(() => {
    // Configure platform-specific settings
    console.log(`App using API URL: ${ENV.API_URL}`);
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }

    setIsConfigLoaded(true);
  }, []);

  // Setup notification channels on app startup
  useEffect(() => {
    try {
      setupNotificationChannels();
    } catch (error) {
      console.error('Error setting up notification channels', error);
    }
  }, []);

  // This function will handle navigation when a notification is tapped
  const handleNotificationResponse = (navigationData: { screen: string, params: any }) => {
    try {
      if (navigationData && navigationData.screen) {
        router.push({
          pathname: navigationData.screen,
          params: navigationData.params || {}
        });
      }
    } catch (error) {
      console.error('Error handling notification navigation', error);
    }
  };

  // Setup notification handler when authenticated
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    if (isAuthenticated) {
      try {
        // Setup notification response handler
        cleanup = setupNotificationResponseHandler(handleNotificationResponse);
      } catch (error) {
        console.error('Error setting up notification response handler', error);
      }
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAuthenticated, router]);

  // Don't render anything until config is loaded
  if (!isConfigLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      {isAuthScreen ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <CustomTabBar {...props} />}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="create" />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="profile" />

          {/* Hidden screens */}
          <Tabs.Screen name="index" options={{ href: null }} />
          <Tabs.Screen name="login" options={{ href: null }} />
          <Tabs.Screen name="register" options={{ href: null }} />

          {/* Additional non-tab screens */}
          <Tabs.Screen
            name="messages"
            options={{
              href: null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="topics"
            options={{
              href: null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="comments"
            options={{
              href: null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="password"
            options={{
              href: null,
              headerShown: false
            }}
          />
        </Tabs>
      )}
    </ThemeProvider>
  );
}
