import { useCallback, useState } from "react";
import {
  View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getRecipes } from "../api/recipes";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { fontSize, fontWeight } from "../constants/typography";

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
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.ingredients?.join(", ")}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>You have not saved any recipes yet.</Text>
          <Text style={styles.emptyText}>
            Click on "Save" in a recipe to add it here.
          </Text>
        </View>
      }
    />
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
  card: {
    backgroundColor: "#fff",
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
    color: "#666",
    marginTop: 4
  },
  error: {
    color: "#c62828",
    textAlign: "center",
    fontSize: fontSize.medium
  },
  emptyTitle: {
    fontSize: fontSize.large,
    fontWeight: fontWeight.bold,
    textAlign: "center"
  },
  emptyText: {
    color: "#666",
    textAlign: "center"
  },
  button: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center"
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: fontSize.medium
  },
});