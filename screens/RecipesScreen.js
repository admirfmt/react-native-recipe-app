import { View, Text, StyleSheet } from "react-native";

export default function RecipesScreen() {
  return (
    <View style={styles.recipesContainer}>
      <Text>Recipes screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  recipesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});