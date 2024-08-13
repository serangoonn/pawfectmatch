import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import Star from "./Star";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/core";
import { firestore, auth } from "../../../utils/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

export default function FeedbackRating() {
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [username, setUsername] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      fetchUserProfile(user.displayName || "");
    }
  }, []);

  const fetchUserProfile = async (username) => {
    try {
      console.log("Fetching profile for username: ", username);
      if (username) {
        const userDocRef = doc(firestore, "userProfiles", username);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);
        } else {
          console.log("No profile found!");
        }
      } else {
        console.log("Username is not set yet.");
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  const handleStarPress = (index) => {
    setRating(index + 1);
  };

  const handleOrganizationPress = (organization) => {
    setSelectedOrganization(organization);
  };

  const handleSubmit = async () => {
    if (!selectedOrganization) {
      Alert.alert("Please select an organization.");
      return;
    }

    if (!rating) {
      Alert.alert("Please provide a rating.");
      return;
    }

    if (!caption) {
      Alert.alert("Please leave a review.");
      return;
    }

    try {
      await addDoc(collection(firestore, "feedback"), {
        username: username,
        organization: selectedOrganization,
        rating: rating,
        review: caption,
        createdAt: new Date(),
      });
      Alert.alert("Review submitted successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error submitting review:", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ImageBackground
        source={require("../HomeStack/images/lightbrown.png")}
        style={styles.background}
      >
        <Image
          source={require("../HomeStack/images/header.png")}
          style={{ alignSelf: "center" }}
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../HomeStack/images/backbutton.png")}
            style={styles.backbutton}
          />
        </TouchableOpacity>
        <ScrollView>
          <View>
            <Text
              style={{
                fontFamily: "Inknut Antiqua Regular",
                fontSize: 20,
                fontWeight: "bold",
                color: "#7D5F26",
                marginLeft: 15,
                marginTop: 40,
                lineHeight: 30,
              }}
            >
              Which organisation did you adopt your new pet from?
            </Text>

            <View style={styles.buttonContainer1}>
              <TouchableOpacity
                style={[
                  styles.buttons,
                  selectedOrganization === "SPCA" && styles.selectedButton,
                ]}
                onPress={() => handleOrganizationPress("SPCA")}
              >
                <Text style={styles.buttonText}>SPCA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttons,
                  selectedOrganization === "The Animal Lodge" &&
                    styles.selectedButton,
                ]}
                onPress={() => handleOrganizationPress("The Animal Lodge")}
              >
                <Text style={styles.buttonText}>The Animal Lodge</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer2}>
              <TouchableOpacity
                style={[
                  styles.buttons,
                  selectedOrganization === "SOSD" && styles.selectedButton,
                ]}
                onPress={() => handleOrganizationPress("SOSD")}
              >
                <Text style={styles.buttonText}>SOSD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttons,
                  selectedOrganization === "Mercylight" &&
                    styles.selectedButton,
                ]}
                onPress={() => handleOrganizationPress("Mercylight")}
              >
                <Text style={styles.buttonText}>Mercylight</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontFamily: "Inknut Antiqua Regular",
                fontSize: 20,
                fontWeight: "bold",
                color: "#7D5F26",
                marginLeft: 15,
                lineHeight: 60,
              }}
            >
              Give a rating for the organisation!
            </Text>

            <View style={styles.starContainer}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  filled={index < rating}
                  onPress={() => handleStarPress(index)}
                />
              ))}
            </View>

            <Text
              style={{
                fontFamily: "Inknut Antiqua Regular",
                fontSize: 20,
                fontWeight: "bold",
                color: "#7D5F26",
                marginLeft: 15,
                marginTop: 10,
                lineHeight: 40,
              }}
            >
              Leave a review!
            </Text>

            <TextInput
              placeholder="Type in your review here..."
              style={styles.input}
              value={caption}
              onChangeText={setCaption}
            />

            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  font: {
    fontsize: 20,
    marginLeft: 10,
    padding: 7,
  },
  background: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#EDD7B5",
  },
  input: {
    width: "90%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginLeft: 20,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#A78446",
  },
  starContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 50,
  },
  buttons: {
    backgroundColor: "#7D5F26",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: "90%",
    marginLeft: 20,
    marginHorizonatal: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#A78446",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "Inknut Antiqua Regular",
  },
  buttonContainer1: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  buttonContainer2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#7D5F26",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    width: "90%",
    marginHorizonatal: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 60,
  },
});
