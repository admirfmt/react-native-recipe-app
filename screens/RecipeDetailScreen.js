import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getRecipe, deleteRecipe } from "../api/recipes";
import { fontSize, fontWeight } from "../constants/typography";
import { buildShareText } from "../utils/shareText";

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setRecipe(await getRecipe(recipeId, token));
    } catch (e) {
      setError(e.status === 404 ? "Recipe not found." : e.message);
    } finally {
      setLoading(false);
    }
  }, [recipeId, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = () => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete the recipe?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDelete },
    ]);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(recipeId, token);
      Alert.alert("Done", "The recipe has been deleted.");
      navigation.goBack();
    } catch (e) {
      setDeleting(false);
      Alert.alert("Error", e.message || "Could not delete the recipe. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: recipe.title,
        message: buildShareText(recipe),
      });

      if (result.action === Share.sharedAction) {
        Alert.alert("Done", "Recipe has been shared.");
      }

    } catch (e) {
      console.error("Sharing was unsuccessful:", e);
      Alert.alert("Error", "Could not share recipe. Try again.");
    }
  };

  if (loading) return <View style={styles.loadingText}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.errorText}><Text>{error}</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.ingredientsTitle}>Ingredients</Text>
      {recipe.ingredients?.map((ing, i) => (
        <Text key={i} style={styles.item}>- {ing}</Text>
      ))}
      <View style={styles.actions}>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
        <Pressable style={styles.button}
          onPress={() => navigation.navigate("RecipeForm", { recipe })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, deleting && { opacity: 0.6 }]}
          onPress={confirmDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#c62828" />
          ) : (
            <Text style={styles.deleteText}>Delete</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12
  },
  recipeTitle: {
    fontSize: fontSize.xLarge,
    fontWeight: fontWeight.bold
  },
  ingredientsTitle: {
    fontSize: fontSize.medium,
    fontWeight: fontWeight.bold
  },
  loadingText: {
    flex: 1,
    justifyContent: "center"
  },
  errorText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  actions: {
    marginTop: 24,
    gap: 12
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
    fontSize: fontSize.medium
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#c62828",
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  deleteText: {
    color: "#c62828",
    textAlign: "center",
    fontSize: fontSize.medium
  },
  shareButton: {
    borderWidth: 1,
    borderColor: "#2e7d32",
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  shareText: {
    color: "#2e7d32",
    textAlign: "center",
    fontSize: fontSize.medium
  },
});