import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RecipesScreen from "./screens/RecipesScreen";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
