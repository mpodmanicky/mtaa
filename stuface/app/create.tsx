import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContex';
import Inputs from '@/components/Inputs';
import { Ionicons } from '@expo/vector-icons';
import Buttons from '@/components/Buttons';
import { Stack } from 'expo-router';
import * as Location from 'expo-location';

export default function CreateScreen() {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [postText, setPostText] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    const place = await getPlaceName(location.coords.latitude, location.coords.longitude);
    setPlaceName(place);
  }
  let text = 'Waiting...';
  if(errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  async function getPlaceName(latitude: number, longitude: number) {
    try {
      const geocodedLocation = await Location.reverseGeocodeAsync({
        latitude, longitude
      });
      if (geocodedLocation && geocodedLocation.length > 0) {
        const place = geocodedLocation[0];
        return place.city + ', ' + place.country;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }


  const categories = [
    { label: 'General', value: 'general' },
    { label: 'Dormitory', value: 'dormitory' },
    { label: 'Canteen', value: 'canteen' },
    { label: 'Library', value: 'library' },
    { label: 'University', value: 'university' },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={theme.colors.background}
        resizeMode="cover"
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.headerText}>Create a New Post</Text>

            {/* Text Input Area */}
            <View >
              <Inputs
                placeholder={placeName}
                isPassword={false}
              />
            </View>

            {/* Row with icons and button */}
            <View style={styles.actionsRow}>
              {/* Media icons */}
              <View style={styles.iconsContainer}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="camera" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="image" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={ () => getCurrentLocation()}>
                  <Ionicons name="location-outline" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              {/* <View>
                <Text>{text}</Text>
              </View> */}

              {/* Post button */}
              <View style={styles.buttonContainer}>
                <Buttons title="Post" onPress={() => {}} />
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Category:</Text>
              <View style={styles.pickerWrapper}>
                <Text>Here will be a picker</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const dynamicStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    marginTop: 40,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
    alignSelf: 'flex-start'
  },
  textInput: {
    height: 170,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginBottom: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
    padding: 5,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
  },
  pickerContainer: {
    width: 300,
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text,
    alignSelf: 'flex-start',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border || '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.card || '#f9f9f9',
  },
  picker: {
    width: '100%',
    height: 50,
    color: theme.colors.text,
  },
});
