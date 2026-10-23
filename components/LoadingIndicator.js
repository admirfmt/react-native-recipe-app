import { View, ActivityIndicator, StyleSheet } from "react-native";

export function LoadingIndicator() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="small" color="#2e7d32" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
});