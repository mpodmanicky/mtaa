import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import ChatPill from '@/components/ChatPill';

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);

  return (
    <ImageBackground
      source={theme.colors.background}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ChatPill
            username="John Doe"
            lastMessage="Hey, how are you?"
            time="10:30 AM"
            avatar={require('@/assets/images/react-logo.png')}
            unread={true}
            onPress={() => {}}
          />
          {/* Add more <ChatPill /> items here */}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const dynamicStyles = (theme: any) =>
  StyleSheet.create({
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
    },
    headerText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    scrollContent: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
  });
