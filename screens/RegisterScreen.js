import { View, Text, StyleSheet } from "react-native";

export default function RegisterScreen() {
  return (
    <View style={styles.registerContainer}>
      <Text>Register screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  registerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});