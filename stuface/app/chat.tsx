import React, { useEffect, useState } from 'react';
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
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define conversation type
interface Conversation {
  id: string;
  participants: string[];
  last_message: string;
  last_message_time: string;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const navigateToMessages = (conversationId: string, displayName: string) => {
    router.push({
      pathname: '/messages',
      params: {
        conversationId: conversationId,
        username: displayName
      }
    });
  };

  // Load user data and conversations
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUsername = await AsyncStorage.getItem('username');

        setUserId(storedUserId);
        setUsername(storedUsername);

        if (storedUserId) {
          fetchConversations(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadData();
  }, []);

  // Fetch conversations function
  const fetchConversations = async (userId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/conversations/${userId}`);
      const result = await response.json();

      console.log('Conversations response:', result);

      if (response.ok && result.data) {
        setConversations(result.data);
      } else {
        console.log('No conversations found or server returned an error');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

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
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              // For display purposes, filter out the current user from participants
              const otherParticipants = conversation.participants.filter(
                participant => participant !== username
              );
              const displayName = otherParticipants.join(', ');

              // Format the timestamp or use a placeholder
              const timeDisplay = conversation.last_message_time
                ? new Date(conversation.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'N/A';

              return (
                <ChatPill
                  key={conversation.id}
                  username={displayName}
                  lastMessage={conversation.last_message || 'No messages yet'}
                  time={timeDisplay}
                  avatar={require('@/assets/images/react-logo.png')}
                  unread={false}
                  onPress={() => navigateToMessages(conversation.id, displayName)}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>No conversations yet</Text>
          )}
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
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
  });
