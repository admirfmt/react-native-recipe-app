import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (username.trim().length < 5)
      return setError("Username must be at least 5 characters long.");
    if (password.trim().length < 8)
      return setError("Password must be at least 8 characters long.");

    setError("");
    console.log("Registering user:", username, password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password (min 8 characters)</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
  link: {
    color: "#2e7d32",
    textAlign: "center",
    marginTop: 16
  },
});