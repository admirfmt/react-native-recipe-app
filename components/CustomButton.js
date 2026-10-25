import { Pressable, Text, StyleSheet } from "react-native";
import { fontSize } from "../constants/typography";
import { colors } from "../constants/colors";
import { LoadingIndicator } from "./LoadingIndicator";

export default function CustomButton({ title, onPress, loading = false, disabled = false, style }) {
  const isDisabled = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <LoadingIndicator color="#fff" /> : <Text style={styles.buttonText}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center"
  },
  buttonText: {
    color: colors.card,
    textAlign: "center",
    fontSize: fontSize.medium
  },
  disabled: {
    opacity: 0.6
  },
});