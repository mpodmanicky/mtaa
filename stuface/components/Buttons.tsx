import React from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  Button,
} from "react-native";

type buttonProps = {
  title: string,
  
}

function Buttons(props: buttonProps ) {
  return (
    <View>
      <TouchableHighlight style={styles.button}>
        <Button title={props.title} color="white" />
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
  },
});

export default Buttons;
