import { ImageBackground, ScrollView, Text, View } from "react-native";
import Login from "./login";
import { Stack, useRouter } from "expo-router";
import Buttons from "@/components/Buttons";

export default function Index() {
  const router = useRouter();
  return (
    <View style={{ flex: 1}}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ImageBackground
        source={require("../assets/images/LoginScreenBackground.png")}
        resizeMode="cover"
        style={{ flex: 1, justifyContent:"center", alignItems: "center"}}
      >
        <View style={{flex: 1, alignItems:"center"}}>
          <Text style={{fontSize: 32, fontWeight: "bold", marginTop: 150}}>STUFace</Text>
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Buttons title="Login" onPress={() => {
              router.push({
                pathname: "/login",
              })
            }}/>
            <Text>OR</Text>
            <Buttons title="Register" onPress={() => {
              router.push({
                pathname: "/register"
              })
            }} />
          </View>
        </View>

      </ImageBackground>

    </View>
  );
}
