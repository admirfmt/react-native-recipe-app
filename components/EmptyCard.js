import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { fontSize, fontWeight } from "../constants/typography";

export default function EmptyCard({ title, message }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12
  },
  emptyTitle: {
    fontSize: fontSize.large,
    fontWeight: fontWeight.bold,
    textAlign: "center"
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center"
  },
});