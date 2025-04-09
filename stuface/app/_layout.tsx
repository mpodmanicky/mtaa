import { ThemeProvider } from "@/context/ThemeContex";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }
  }, []);

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
