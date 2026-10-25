import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { fontSize, fontWeight } from "../constants/typography";
import CustomButton from "../components/CustomButton";
import { spacing } from "../constants/spacing";
import { colors } from "../constants/colors";

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
      Alert.alert("Done", "You are logged in.");
      navigation.navigate("Home");
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

      <CustomButton
        title="Login"
        onPress={handleLogin}
        loading={busy}
      />

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an a account? Register</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.large,
    gap: 8
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.small,
    fontSize: fontSize.medium,
    minHeight: 48
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xSmall
  },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.medium
  },
});