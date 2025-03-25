import Buttons from "@/components/Buttons";
import React, { useState } from "react";
import {
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
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
        <Buttons title="Login" />
        <Text>OR</Text>
        <Buttons title="Register" />
      </View>
    </ImageBackground>
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
