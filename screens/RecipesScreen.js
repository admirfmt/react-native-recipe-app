import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getRecipes } from "../api/recipes";
import { CATEGORIES } from "../config";
import { fontSize, fontWeight } from "../constants/typography";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { useFavorites } from "../context/FavoritesContext";
import { ChipCategory } from "../components/ChipCategory";

export default function RecipesScreen({ navigation }) {
  const { token, user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const requestId = useRef(0);
  const { isFavorite } = useFavorites();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadRecipes = useCallback(async () => {
    const id = ++requestId.current;
    setError("");
    setFetching(true);
    try {
      const data = await getRecipes(token, { search, category });
      if (id !== requestId.current) return;
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e.message);
    } finally {
      if (id === requestId.current) {
        setFetching(false);
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token, search, category]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const onSearch = () => {
    setSearchText("");
    setSearch("");
  };

  const clearFilters = () => {
    setSearchText("");
    setSearch("");
    setCategory("");
  };

  const hasFilter = !!search || !!category;

  const renderEmpty = () => {
    if (loading || fetching) return null;
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
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          {hasFilter ? "No recipe matching your search." : "No recipes found."}
        </Text>
        {hasFilter ? (
          <Pressable style={styles.button} onPress={clearFilters}>
            <Text style={styles.buttonText}>Clear filter</Text>
          </Pressable>
        ) : (
          <Text style={styles.emptyText}>Create your first recept to get started.</Text>
        )}
      </View>
    );
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <LoadingIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? <Text style={styles.userLine}>Logged in as {user.username}</Text> : null}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search"
          autoCapitalize="none"
          returnKeyType="search"
        />

        {searchText ? (
          <Pressable onPress={onSearch} style={styles.clear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <ChipCategory
            label="All"
            active={!category}
            onPress={() => setCategory("")}
          />
          {CATEGORIES.map((c) => (
            <ChipCategory
              key={c}
              label={c}
              active={category === c}
              onPress={() => setCategory(category === c ? "" : c)}
            />
          ))}
        </ScrollView>
      </View>

      {fetching ? <LoadingIndicator style={{ marginVertical: 8 }} /> : null}

      <FlatList
        data={error ? [] : recipes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          recipes.length === 0 || error ? { flexGrow: 1 } : { padding: 16, gap: 12, paddingBottom: 96 }
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
          >
            <Text style={styles.title}>
              {isFavorite(item.id) ? "♥ " : ""}{item.title}
            </Text>
            <Text style={styles.category}>{item.category || "Other"}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.ingredients?.join(", ")}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
    gap: 8
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: fontSize.medium,
    minHeight: 48,
    backgroundColor: "#fff",
  },
  clear: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  clearText: {
    color: "#2e7d32",
    fontSize: fontSize.medium
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
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
  category: {
    color: "#2e7d32",
    marginTop: 2,
    fontSize: fontSize.small
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
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: fontSize.medium
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
    fontSize: fontSize.medium,
    fontWeight: fontWeight.bold
  },
  userLine: { paddingHorizontal: 16, paddingTop: 12, color: "#666" },
});