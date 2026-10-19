import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getRecipes } from "../api/recipes";

export default function RecipesScreen({ navigation }) {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRecipes = useCallback(async () => {
    setError("");
    try {
      const data = await getRecipes(token);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={loadRecipes}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={recipes.length === 0 ? styles.center : styles.content}
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
            <Text style={styles.emptyTitle}>No recipes found.</Text>
            <Text style={styles.emptyText}>Create your first recipe to get started.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate("RecipeForm")}>
        <Text style={styles.fabText}>+ New Recipe</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 12
  },
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
    fontSize: 18,
    fontWeight: "bold"
  },
  meta: {
    color: "#666",
    marginTop: 4
  },
  error: {
    color: "#c62828",
    textAlign: "center",
    fontSize: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600"
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
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#2e7d32",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
});