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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define post type
interface Post {
  id: string;
  username: string;
  body: string;
  likes: number;
  comments: number;
  timestamp: string;
  location?: string; // Add optional location field
}

export default function TopicScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [postId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load current user's username and ID
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserId = await AsyncStorage.getItem('userId');
        setCurrentUsername(storedUsername);
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Fetch posts for the selected topic
  useEffect(() => {
    fetchPostsForTopic();
  }, [id]);

  const fetchPostsForTopic = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch posts for the topic
      const response = await fetch(`http://10.0.2.2:8080/topics/${id}/posts`);
      const result = await response.json();

      if (response.ok && result.data) {
        // Transform the data to match our Post interface
        const formattedPosts = result.data.map((post: any) => {
          return {
            id: post.id.toString(),
            username: post.username,
            body: post.content,
            likes: post.votes,
            comments: post.comment_count || 0,
            timestamp: new Date(post.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            location: post.location || undefined, // Map the location field
          };
        });

        setPosts(formattedPosts);
      } else {
        console.log('Error fetching posts or no posts found:', result.error);
        // Use fallback posts if fetch fails
        useFallbackPosts();
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      useFallbackPosts();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback posts when API fails
  const useFallbackPosts = () => {
    setPosts([
      {
        id: '1',
        username: 'turcio',
        body: 'Could not load posts from server. This is a fallback post.',
        likes: 0,
        comments: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLikePress = async (postId: string) => {
    if (!currentUsername || !userId) return; // Don't allow liking if user data isn't loaded

    try {
      // Determine if the user is liking or unliking
      const isLiking = !likedPosts[postId];
      const voteValue = isLiking ? 1 : -1;

      // Optimistically update UI
      setLikedPosts((prev) => {
        const updatedLikes = { ...prev };
        if (isLiking) {
          updatedLikes[postId] = true;
        } else {
          delete updatedLikes[postId];
        }
        return updatedLikes;
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiking ? post.likes + 1 : post.likes - 1 }
            : post
        )
      );

      // Update vote on server
      const response = await fetch(`http://10.0.2.2:8080/post/${postId}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote: voteValue })
      });

      if (!response.ok) {
        // If server update fails, revert the optimistic update
        console.log('Failed to update vote on server');
        setLikedPosts((prev) => {
          const updatedLikes = { ...prev };
          if (!isLiking) {
            updatedLikes[postId] = true;
          } else {
            delete updatedLikes[postId];
          }
          return updatedLikes;
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: isLiking ? post.likes - 1 : post.likes + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error updating post vote:', error);
    }
  };

  const handleCommentPress = (postId: string, username: string) => {
    router.push({
      pathname: '/topics/comments',
      params: { postId, username },
    });
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
            <Text style={styles.headerText}>{name || 'Topic'}</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {posts.length > 0 ? (
                posts.map((post) => (
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

                      {post.location && (
                        <View style={styles.locationContainer}>
                          <Ionicons name="location" size={14} color="#0066FF" />
                          <Text style={styles.locationText}>{post.location}</Text>
                        </View>
                      )}

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
                        <TouchableWithoutFeedback
                          onPress={() => handleCommentPress(post.id, post.username)}
                        >
                          <View style={styles.statItem}>
                            <Image
                              source={require('@/assets/images/comment.png')}
                              style={styles.statIcon}
                            />
                            <Text style={styles.statText}>{post.comments}</Text>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No posts yet in this topic</Text>
              )}
            </ScrollView>
          )}
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
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
      padding: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#5182FF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: 'black',
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
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
      width: 14,
      height: 14,
      marginRight: 4,
    },
    statText: {
      fontSize: 12,
      color: '#000000',
    },
    timestampText: {
      color: '#000000',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    locationText: {
      fontSize: 12,
      color: '#0066FF',
      marginLeft: 4,
      fontStyle: 'italic',
    },
  });
