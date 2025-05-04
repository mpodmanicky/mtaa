import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContex';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/**
 * Component representing iOS-style navigation bar
 * Fixed to the bottom of the screen
 */
export default function TaskBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = getIconName(route.name, isFocused);

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? theme?.colors.primary || "#405DE6" : "#8E8E93"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getIconName = (routeName: string, isFocused: boolean) => {
  switch (routeName) {
    case 'home':
      return isFocused ? "home" : "home-outline";
    case 'search':
      return isFocused ? "search" : "search-outline";
    case 'create':
      return isFocused ? "add-circle" : "add-circle-outline";
    case 'chat':
      return isFocused ? "chatbubbles" : "chatbubbles-outline";
    case 'profile':
      return isFocused ? "person" : "person-outline";
    default:
      return "help-circle-outline";
  }
};

const dynamicStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "#D1D1D6",
    justifyContent: "space-around",
    alignItems: "center",
    height: Platform.OS === 'ios' ? 85 : 65, // Extra height for iOS
    paddingBottom: Platform.OS === 'ios' ? 25 : 0, // Safe area for iOS
    width: '100%',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 10,
  }
});
