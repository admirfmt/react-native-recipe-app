import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { fontSize, fontWeight } from "../constants/typography";
import { useAuth } from "../context/AuthContext";
import CustomButton from "../components/CustomButton";

export default function HomeScreen({ navigation }) {
  const { isSignedIn, user, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe App</Text>
      <Text style={styles.subtitle}>Find, create, save and share recipes.</Text>

      {isSignedIn ? (
        <>
          {user ? (
            <Text style={styles.signedInAs}>Logged in as {user.username}</Text>
          ) : null}

          <CustomButton
            title="View Recipes"
            onPress={() => navigation.navigate("Recipes")}
          />
          <Pressable style={styles.secondary} onPress={async () => {
            await signOut();
            Alert.alert("Done", "You have been logged out.");
          }}>
            <Text style={styles.secondaryText}>Logout</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={styles.secondary}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.secondaryText}>Register</Text>
          </Pressable>
          <CustomButton
            title="Log in"
            onPress={() => navigation.navigate("Login")}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: fontSize.xxLarge,
    fontWeight: fontWeight.bold,
    textAlign: "center"
  },
  subtitle: {
    fontSize: fontSize.medium,
    textAlign: "center",
    color: "#555"
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#2e7d32",
    padding: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  secondaryText: {
    color: "#2e7d32",
    textAlign: "center",
    fontSize: fontSize.medium
  },
  signedInAs: {
    textAlign: "center",
    color: "#2e7d32",
    fontSize: 16,
    fontWeight: "600"
  },
});