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
  Image,
  TouchableWithoutFeedback,
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
  const handleLikePress = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };
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
                  <View style={styles.stats}>
                    <Text style={[styles.statText, styles.timestampText]}>
                      {post.timestamp}
                    </Text>
                    <TouchableWithoutFeedback
                      onPress={() => handleLikePress(post.id)}
                    >
                      <View style={styles.statItem}>
                        <Image
                          source={require('@/assets/images/like_topik.png')}
                          style={styles.statIcon}
                        />
                        <Text style={styles.statText}>{post.likes}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.statItem}>
                      <Image
                        source={require('@/assets/images/comment.png')}
                        style={styles.statIcon}
                      />
                      <Text style={styles.statText}>{post.comments}</Text>
                    </View>
                  </View>
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
      color: '#000000',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 'auto',
      paddingTop: 10,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
    },
    statIcon: {
      width: 12,
      height: 12,
      marginRight: 4,
    },
    statText: {
      fontSize: 12,
      color: '#000000',
    },
    timestampText: {
      color: '#000000',
    },
  });
