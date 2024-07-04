import {
  Alert,
  TextInput,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { auth } from "../utils/firebase";
import { useNavigation } from "@react-navigation/core";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  // Change the password
  const handleForgotPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent");
      })
      .catch((error) => {
        Alert.alert("Error", "Invalid email address");
      });
  };

  return (
    <ImageBackground
      source={require("../images/ForgotPasswordBackground.png")}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.infoText}>
          Enter your email and we'll send you a link to change your password!
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          placeholder={"Email"}
          onChangeText={setEmail}
        />

        <TouchableOpacity onPress={handleForgotPassword}>
          <Image
            source={require("../images/ForgotPasswordButton.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  infoText: {
    fontSize: 25,
    textAlign: "center",
    color: "white",
    marginBottom: 40,
    marginTop: 90,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#f2dcae",
    paddingHorizontal: 10,
    marginBottom: 30,
    width: "80%",
    borderRadius: 30,
  },
  buttonImage: {
    width: 200,
    height: 60,
  },
  goBack: {
    padding: 30,
  },
  goBackText: {
    color: "white",
    textAlign: "center",
  },
});
