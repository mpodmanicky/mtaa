import Buttons from "@/components/Buttons";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      {/*TouchableWithoutFeedback nemoze mat viac ako jedno dieta takze pouzivame <></> */}
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitle: "",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ImageBackground
          source={require("../assets/images/LoginScreenBackground.png")}
          resizeMode="cover"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={{
              position: "absolute",
              top: 50,
              left: 20,
              zIndex: 1,
              padding: 8,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#5182FF",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "black",
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 1,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={"white"} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                marginTop: 120,
                marginBottom: 120,
              }}
            >
              STUFace
            </Text>
            <TextInput style={styles.input} placeholder="Username" />
            <TextInput
              secureTextEntry={true}
              style={styles.input}
              placeholder="Password"
            />
            <Buttons title="Login" onPress={() => {}} />
            <Text>OR</Text>
            <Buttons title="Register" onPress={() => {}} />
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#B3E5EB",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 1,
    width: 260,
    height: 50,
    margin: 10,
  },
  button: {
    backgroundColor: "#5182FF",
    borderRadius: 25,
    width: 150,
    margin: 25,
  },
});
