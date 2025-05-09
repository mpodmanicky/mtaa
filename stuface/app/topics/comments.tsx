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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
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
}

// Define comment type
interface Comment {
  id: string;
  username: string;
  text: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export default function CommentsScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  const { postId, username } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [postId: string]: boolean }>(
    {}
  );
  const [likedComments, setLikedComments] = useState<{
    [commentId: string]: boolean;
  }>({});
  const [commentsByPost, setCommentsByPost] = useState<{
    [postId: string]: Comment[];
  }>({});

  // Load current user's username
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setCurrentUsername(storedUsername);
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };

    loadUsername();
  }, []);

  useEffect(() => {
    // Mock data for the post based on postId
    const mockPosts: Post[] = [
      {
        id: '1',
        username: 'turcio',
        body: 'Post body',
        likes: 10,
        comments: 28,
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
    ];
    const foundPost = mockPosts.find((p) => p.id === postId);
    setPost(foundPost || null);
  }, [postId]);

  const handleLikePress = (postId: string) => {
    if (!currentUsername || !post) return; // Don't allow liking if username or post isn't loaded

    setLikedPosts((prev) => {
      const hasLiked = !!prev[postId];
      const updatedLikes = { ...prev };

      if (hasLiked) {
        // Unlike: Remove the like
        delete updatedLikes[postId];
      } else {
        // Like: Add the like
        updatedLikes[postId] = true;
      }

      // Update the post state with the new like count
      setPost((prevPost) =>
        prevPost
          ? {
              ...prevPost,
              likes: hasLiked ? prevPost.likes - 1 : prevPost.likes + 1,
            }
          : null
      );

      return updatedLikes;
    });
  };

  const handleCommentLikePress = (commentId: string) => {
    if (!currentUsername) return; // Don't allow liking if username isn't loaded

    setLikedComments((prev) => {
      const hasLiked = !!prev[commentId];
      const updatedLikes = { ...prev };

      if (hasLiked) {
        // Unlike: Remove the like
        delete updatedLikes[commentId];
      } else {
        // Like: Add the like
        updatedLikes[commentId] = true;
      }

      // Update the comments state with the new like count
      setCommentsByPost((prevComments) => {
        const updatedComments = { ...prevComments };
        const postComments = updatedComments[postId || ''] || [];
        updatedComments[postId || ''] = postComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment
        );
        return updatedComments;
      });

      return updatedLikes;
    });
  };

  const handleCommentSubmit = () => {
    if (commentText.trim() && currentUsername && post && postId) {
      const newComment: Comment = {
        id: Date.now().toString(), // Simple unique ID based on timestamp
        username: currentUsername,
        text: commentText,
        likes: 0,
        comments: 0,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setCommentsByPost((prevComments) => {
        const updatedComments = { ...prevComments };
        updatedComments[postId] = [
          ...(updatedComments[postId] || []),
          newComment,
        ];
        return updatedComments;
      });
      setPost((prevPost) =>
        prevPost ? { ...prevPost, comments: prevPost.comments + 1 } : null
      );
      setCommentText(''); // Clear input after submission
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
            <Text style={styles.headerText}>dormitory comment answer</Text>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -40 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {post && (
                <View>
                  <View style={styles.postCard}>
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
                  {(
                    commentsByPost[
                      Array.isArray(postId) ? postId[0] : postId || ''
                    ] || []
                  ).map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      <View style={styles.usernameContainer}>
                        <Ionicons
                          name="send"
                          size={16}
                          color={theme.colors.text}
                          style={styles.airplaneIcon}
                        />
                        <Text style={styles.username}>{comment.username}</Text>
                      </View>
                      <View style={styles.bodyContainer}>
                        <Text style={styles.body}>{comment.text}</Text>
                        <View style={styles.stats}>
                          <Text style={[styles.statText, styles.timestampText]}>
                            {comment.timestamp}
                          </Text>
                          <TouchableWithoutFeedback
                            onPress={() => handleCommentLikePress(comment.id)}
                          >
                            <View style={styles.statItem}>
                              <Image
                                source={require('@/assets/images/like_topik.png')}
                                style={styles.statIcon}
                              />
                              <Text style={styles.statText}>
                                {comment.likes}
                              </Text>
                            </View>
                          </TouchableWithoutFeedback>
                          <View style={styles.statItem}>
                            <Image
                              source={require('@/assets/images/comment.png')}
                              style={styles.statIcon}
                            />
                            <Text style={styles.statText}>
                              {comment.comments}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <View style={styles.inputContainer}>
              <View style={styles.separator} />
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={`Add a comment for ${username}`}
                  placeholderTextColor="#888"
                  onSubmitEditing={handleCommentSubmit}
                />
              </View>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleCommentSubmit}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={
                    commentText.trim()
                      ? theme.colors.primary
                      : theme.colors.text
                  }
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      padding: 15,
    },
    postCard: {
      marginBottom: 15,
    },
    commentCard: {
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
      minHeight: 50,
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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingBottom: 20,
      marginTop: -20,
      marginBottom: 30,
      backgroundColor: '#fff',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 8,
    },
    inputWrapper: {
      flex: 1,
      marginRight: 8,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      fontSize: 14,
      color: '#000',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
