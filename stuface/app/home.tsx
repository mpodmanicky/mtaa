import { Stack } from "expo-router";
import React from "react";
import { Text, ImageBackground, ScrollView, View } from "react-native";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <ImageBackground
          source={require("../assets/images/NormalBackground.png")}
          resizeMode="cover"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text>Sem Pojdu nase krasne topiky a potom si budem musiet vytvorit activityBar</Text>
        </ImageBackground>
      </ScrollView>
    </>
  );
}
