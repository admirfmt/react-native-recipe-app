import { Pressable, Text, StyleSheet } from "react-native";
import { fontSize, fontWeight } from "../constants/typography";
import { colors } from "../constants/colors";

export default function RecipeCard({ recipe, onPress }) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {recipe.ingredients?.join(", ")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    },
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: fontWeight.bold
  },
  meta: {
    color: colors.muted,
    marginTop: 4
  },
});