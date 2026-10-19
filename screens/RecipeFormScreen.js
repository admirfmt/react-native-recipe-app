import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { createRecipe } from "../api/recipes";

export default function RecipeFormScreen({ navigation }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    const ingredients = ingredientsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!title.trim()) return setError("Write a title for the recipe.");
    if (ingredients.length === 0) return setError("Write at least one ingredient.");

    setError("");
    setBusy(true);
    try {
      await createRecipe({ title: title.trim(), ingredients }, token);
      Alert.alert("Done", "The recipe has been saved.");
      navigation.goBack();
    } catch (e) {
      setError(e.message || "Could not save the recipe. Please try again.");
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Pancakes"
      />

      <Text style={styles.label}>Ingredients (one per line)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={ingredientsText}
        onChangeText={setIngredientsText}
        multiline
        textAlignVertical="top"
        placeholder={"3 dag flour\n6 dl milk\n3 eggs"}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Recipe</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  multiline: {
    minHeight: 140
  },
  error: {
    color: "#c62828",
    marginTop: 4
  },
  button: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16
  },
});