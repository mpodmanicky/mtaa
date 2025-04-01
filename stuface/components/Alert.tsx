import { useTheme } from "@/context/ThemeContex";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type alertProps = {
  message: string;
  error: boolean;
};
export default function Alert(props: alertProps) {
  const { theme } = useTheme();
  const styles = dynamicStyles(theme);
  return (
    <View> {/** style applied to parent is inherited by the child */}
      <Text>{props.message}</Text>
    </View>
  );
}

const dynamicStyles = (theme: any) =>
  StyleSheet.create({
    alert: {
      backgroundColor: theme.colors.alert,
      color: theme.colors.alertText,
    },
  });
