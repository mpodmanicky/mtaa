import React from 'react'
import { Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

/**
 * Component representing navigation bar
 * Fixed to the bottom of the screen
 */
export default function TaskBar() {
  return (
    <>
    /**home, topics, chat, new post and profile */
    <Text style={styles.icons}>
        <Ionicons name="home" size={24} color="black" />
        <Ionicons name="book" size={24} color="black" />
        <Ionicons name="add-circle" size={24} color="black" />
        <Ionicons name="chatbubbles" size={24} color="black" />
        <Ionicons name="person" size={24} color="black" />
    </Text>
    </>
  )
}

const styles = StyleSheet.create({
    icons: {
        padding: 10,
        margin: 10,
        color: "black",
        backgroundColor: "white",
        borderRadius: 10,
        opacity: 0.8,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1,
    },
})
