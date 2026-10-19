import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider } from "./context/AuthContext";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RecipesScreen from "./screens/RecipesScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import RecipeFormScreen from "./screens/RecipeFormScreen";

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Recipe App" }}
          />
          <Stack.Screen
            name="Recipes"
            component={RecipesScreen}
            options={{ title: "Recipes" }}
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
            options={{ title: "New Recipe" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
