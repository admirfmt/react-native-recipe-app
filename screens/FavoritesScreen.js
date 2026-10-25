import { useCallback, useState } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getRecipes } from "../api/recipes";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { fontSize } from "../constants/typography";
import RecipeCard from "../components/RecipeCard";
import EmptyCard from "../components/EmptyCard";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function FavoritesScreen({ navigation }) {
  const { token } = useAuth();
  const { ids, loaded } = useFavorites();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const all = await getRecipes(token);
      setRecipes(all.filter((r) => ids.includes(r.id)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, ids]);

  useFocusEffect(
    useCallback(() => {
      if (loaded) load();
    }, [load, loaded])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <LoadingIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={
        recipes.length === 0 ? { flexGrow: 1 } : { padding: 16, gap: 12 }
      }
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
        />
      )}
      ListEmptyComponent={
        <EmptyCard
          title="You have not added any recipes yet."
          message='Click on "Add to Favorites" in a recipe to add it here.'
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
    gap: 12
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    fontSize: fontSize.medium
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center"
  },
  buttonText: {
    color: colors.card,
    textAlign: "center",
    fontSize: fontSize.medium
  },
});