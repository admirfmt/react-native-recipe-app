import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, Pressable, Text } from "react-native";

import { useAuth, AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RecipesScreen from "./screens/RecipesScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import RecipeFormScreen from "./screens/RecipeFormScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import { fontSize } from "./constants/typography";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isSignedIn, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    Alert.alert("Done", "You have been logged out.");
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Recipe App" }}
            />
            <Stack.Screen
              name="Recipes"
              component={RecipesScreen}
              options={({ navigation }) => ({
                title: "My Recipes",
                headerLeft: () => (
                  <Pressable onPress={handleSignOut} >
                    <Text style={{ color: "#c62828", fontSize: 16 }}>Log out</Text>
                  </Pressable>
                ),
                headerRight: () => (
                  <Pressable onPress={() => navigation.navigate("Favorites")}>
                    <Text style={{ color: "#2e7d32", fontSize: fontSize.large }}>Favorites</Text>
                  </Pressable>
                ),
              })}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Log in" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
            <Stack.Screen
              name="RecipeDetail"
              component={RecipeDetailScreen}
              options={{ title: "Recipe Detail" }}
            />
            <Stack.Screen
              name="RecipeForm"
              component={RecipeFormScreen}
              options={({ route }) => ({
                title: route.params?.recipe ? "Edit Recipe" : "New Recipe"
              })}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: "Favorite Recipes " }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Recipe App" }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Log in" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default function App() {

  return (
    <AuthProvider>
      <FavoritesProvider>
        <AppNavigator />
      </FavoritesProvider>
    </AuthProvider>
  );
}
