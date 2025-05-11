import { ThemeProvider } from "@/context/ThemeContex";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Platform, StatusBar } from "react-native";
import { Stack, Tabs, usePathname, useRouter } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";
import { ENV } from "@/utils/env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, setupNotificationListeners } from "@/utils/notifications";

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthScreen = pathname === '/login' || pathname === '/register' || pathname === '/';
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const cleanupListenersRef = useRef<() => void>();

  // Navigation callback for notifications
  const handleNotificationNavigation = useCallback((navInfo: { screen: string, params: any }) => {
    router.push({
      pathname: navInfo.screen,
      params: navInfo.params
    });
  }, [router]);

  useEffect(() => {
    // Configure platform-specific settings
    console.log(`App using API URL: ${ENV.API_URL}`);
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }

    // Check authentication status and initialize notifications
    const initializeApp = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const isLoggedIn = !!userId;
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn) {
        // Register for push notifications if user is logged in
        await registerForPushNotificationsAsync();
      }

      setIsConfigLoaded(true);
    };

    initializeApp();
  }, []);

  // Setup notification listeners when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthScreen) {
      // Setup notification listeners and store cleanup function
      cleanupListenersRef.current = setupNotificationListeners(handleNotificationNavigation);

      // Clean up listeners when component unmounts or auth status changes
      return () => {
        if (cleanupListenersRef.current) {
          cleanupListenersRef.current();
        }
      };
    }
  }, [isAuthenticated, isAuthScreen, handleNotificationNavigation]);

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
        </Tabs>
      )}
    </ThemeProvider>
  );
}
