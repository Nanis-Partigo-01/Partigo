import { useAuth } from "@/context/AuthContext";
import { registerApi } from "@/utils/api/auth.api";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Register() {
  // --- EXISTING LOGIC ---
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load role + device ID safely
  useEffect(() => {
    const init = async () => {
      const storedRole = await AsyncStorage.getItem("role");
      setRole(storedRole);

      setDeviceId(
        Device.deviceName || Device.osInternalBuildId || "unknown-device",
      );
    };

    init();
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !name || !phoneNumber) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    if (!role) {
      return Alert.alert("Error", "Role not found");
    }

    setLoading(true);

    try {
      const res = await registerApi({
        email,
        password,
        name,
        phoneNumber,
        role,
        companyName,
        deviceId,
      });

      // Save auth globally
      await login(res.data.accessToken.accessToken);

      router.replace("/(tabs)/");
    } catch (err: any) {
      const msg = err.response?.data?.message;

      Alert.alert(
        "Error",
        Array.isArray(msg) ? msg.join("\n") : msg || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDER ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. HEADER & LOGO */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="restaurant-menu" size={40} color="#1FA2A6" />
              <Text style={styles.logoTextInside}>COOK</Text>
            </View>
            <Text style={styles.title}>PartTimeMatch</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. FORM SECTION */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Your name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              {name.length > 2 && (
                <View style={styles.checkIconContainer}>
                  <FontAwesome name="check" size={10} color="#fff" />
                </View>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {email.includes("@") && (
                <View style={styles.checkIconContainer}>
                  <FontAwesome name="check" size={10} color="#fff" />
                </View>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#A0A0A0"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>

            {/* Company Name (Optional) */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Company Name (optional)"
                placeholderTextColor="#A0A0A0"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
              />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 3. DIVIDER (OR) */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 4. SOCIAL BUTTONS */}
          <View style={styles.socialContainer}>
            {/* Facebook */}
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialIconCircle}>
                <FontAwesome name="facebook" size={20} color="#1877F2" />
              </View>
              <Text style={styles.socialButtonText}>Connect with Facebook</Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialIconCircle}>
                <AntDesign name="google" size={20} color="#DB4437" />
              </View>
              <Text style={styles.socialButtonText}>Connect with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    // INCREASED padding to add space at the top
    paddingTop: 80,
    paddingBottom: 40,
  },
  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(31, 162, 166, 0.1)", // Primary with low opacity
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoTextInside: {
    color: "#1FA2A6",
    fontWeight: "800",
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: "#888",
  },
  linkText: {
    fontSize: 14,
    color: "#1FA2A6",
    fontWeight: "bold",
  },
  // Form
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F4EFEA", // 'input-bg-light'
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#2E2E2E",
  },
  checkIconContainer: {
    position: "absolute",
    right: 16,
    top: 18,
    backgroundColor: "#ccc",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  registerButton: {
    backgroundColor: "#1FA2A6", // 'primary'
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    // Shadows
    shadowColor: "#1FA2A6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    opacity: 0.6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  // Social
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4EFEA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  socialIconCircle: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  socialButtonText: {
    flex: 1,
    textAlign: "center",
    color: "#2E2E2E",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 24, // visual balance
  },
  // Footer
  bottomIndicator: {
    width: 120,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 30,
  },
});
