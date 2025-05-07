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
} from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PillBox from '@/components/PillBox';

// Define post type
interface Post {
  id: string;
  username: string;
  body: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export default function TopicScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts([
      {
        id: '1',
        username: 'turcio',
        body: 'Post body',
        likes: 10,
        comments: 10,
        timestamp: '10:20',
      },
      {
        id: '2',
        username: 'ZK0T017',
        body: 'Post body',
        likes: 10,
        comments: 10,
        timestamp: '13:10',
      },
      {
        id: '3',
        username: 'Eesordi',
        body: 'Post body',
        likes: 10,
        comments: 2,
        timestamp: '7:10',
      },
      {
        id: '4',
        username: 'otetef',
        body: 'Post body',
        likes: 3,
        comments: 18,
        timestamp: '23:10',
      },
    ]);
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={theme.colors.background}
        resizeMode="cover"
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {id === 'library' ? 'Library Topic' : 'Topic'}
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.usernameContainer}>
                  <Ionicons
                    name="send"
                    size={16}
                    color={theme.colors.text}
                    style={styles.airplaneIcon}
                  />
                  <Text style={styles.username}>{post.username}</Text>
                </View>
                <View style={styles.bodyContainer}>
                  <Text style={styles.body}>{post.body}</Text>
                </View>
                <View style={styles.stats}>
                  <Text style={styles.statText}>{post.timestamp}</Text>
                  <Text style={styles.statText}>{post.likes} ❤️</Text>
                  <Text style={styles.statText}>{post.comments} 💬</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const dynamicStyles = (theme: any) =>
  StyleSheet.create({
    background: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingTop: StatusBar.currentHeight || 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.colors.primary,
    },
    backButton: {
      padding: 5,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      flex: 1,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 15,
    },
    postCard: {
      marginBottom: 15,
    },
    usernameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    airplaneIcon: {
      marginRight: 5,
    },
    username: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    bodyContainer: {
      backgroundColor: '#E0F7FA',
      borderRadius: 10,
      padding: 20,
      minHeight: 100,
    },
    body: {
      fontSize: 14,
      color: '#000000', // Changed to black for better contrast
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 5,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.text,
      marginLeft: 10,
    },
  });
