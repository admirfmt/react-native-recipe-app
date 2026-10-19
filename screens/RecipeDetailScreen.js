import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getRecipe } from "../api/recipes";
import { useEffect, useState } from "react";

export default function RecipeDetailScreen({ route }) {
  const { recipeId } = route.params;
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setRecipe(await getRecipe(recipeId, token));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId, token]);

  if (loading) return <View style={styles.loadingText}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.errorText}><Text>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.ingredientsTitle}>Ingredients</Text>
      {recipe.ingredients?.map((ing, i) => (
        <Text key={i}>- {ing}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  loadingText: {
    flex: 1,
    justifyContent: "center"
  },
  errorText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});