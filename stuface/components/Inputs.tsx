import React from 'react'
import { TextInput, StyleSheet } from 'react-native';

type inputProps = {
    placeholder: string;
    isPassword: boolean;
}

export default function Inputs( props: inputProps) {
  return (
    <TextInput style={styles.input} secureTextEntry={props.isPassword} placeholder={props.placeholder}>
    </TextInput>
  )
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
})
