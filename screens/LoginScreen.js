import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fontSize, fontWeight } from "../constants/typography";

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return setError("Username is required.");
    if (!password) return setError("Password is required.");

    setError("");
    setBusy(true);
    try {
      await signIn(username.trim(), password);
    } catch (e) {
      setError(
        e.status === 400 || e.status === 401
          ? "Wrong username or password."
          : e.message
      );
      setBusy(false);
    }
    console.log("Logging in user:", username, password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername}
        autoCapitalize="none" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.button, busy && { opacity: 0.6 }]} onPress={handleLogin} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an a account? Register</Text>
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
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: fontSize.medium,
    minHeight: 48
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
    marginTop: 16
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: fontSize.medium
  },
  link: {
    color: "#2e7d32",
    textAlign: "center",
    marginTop: 16
  },
});