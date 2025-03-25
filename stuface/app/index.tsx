import { ImageBackground, ScrollView, Text, View } from "react-native";
import Login from "./login";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <View style={{ flex: 1, }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ImageBackground
        source={require("../assets/images/LoginScreenBackground.png")}
        resizeMode="cover"
        style={{ flex: 1, }}
      >
        <ScrollView scrollEnabled={false}>
          <Login />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
