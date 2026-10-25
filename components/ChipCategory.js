import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export function ChipCategory({ label, active, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={active}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    minHeight: 40,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primary
  },
  chipText: {
    color: colors.primary
  },
  chipTextActive: {
    color: colors.card
  },
});