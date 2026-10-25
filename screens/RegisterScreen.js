import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { fontSize, fontWeight } from "../constants/typography";
import { LoadingIndicator } from "../components/LoadingIndicator";
import CustomButton from "../components/CustomButton";
import { spacing } from "../constants/spacing";
import { colors } from "../constants/colors";

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!username) return setError("Username is required.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters long.");

    setError("");
    setBusy(true);
    try {
      await signUp(username.trim(), password);
      Alert.alert("Done", "Account created successfully and now you can log in.");
      navigation.navigate("Login");
    } catch (e) {
      setError(e.status === 409 ? "Username already exists." : e.message);
      setBusy(false);
    }
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

      <CustomButton
        title="Register"
        onPress={handleRegister}
        loading={busy}
      />

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
    minHeight: 48,
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