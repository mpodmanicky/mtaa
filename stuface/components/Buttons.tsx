import React from "react";
import { View, StyleSheet, TouchableHighlight, Button, Text } from "react-native";

type buttonProps = {
  title: string;
  onPress: () => void;
};

function Buttons(props: buttonProps) {
  return (
    <View>
      <TouchableHighlight style={styles.button} onPress={props.onPress}>
        <Text style={{ fontSize: 16, color: "white", textAlign: "center", padding: 10}}>{props.title}</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#5182FF",
    borderRadius: 25,
    width: 150,
    margin: 25,
    shadowColor: "black",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
});

export default Buttons;
