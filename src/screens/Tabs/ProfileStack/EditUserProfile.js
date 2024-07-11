import {
  Alert,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";
import { firestore, storage } from "../../../utils/firebase";
import { collection, setDoc, getDoc, doc } from "firebase/firestore";
import {
  SelectList,
  MultipleSelectList,
} from "react-native-dropdown-select-list";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";

export default function EditUserProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const username = route.params?.username || "";

  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");

  const locationOptions = [
    { key: "1", value: "North Region" },
    { key: "2", value: "North East Region" },
    { key: "3", value: "East Region" },
    { key: "4", value: "Central Region" },
    { key: "5", value: "West Region" },
  ];
  const [animal, setAnimalType] = useState("");
  const animalOptions = [
    { key: "1", value: "Dog" },
    { key: "2", value: "Cat" },
    { key: "3", value: "Hamster" },
    { key: "4", value: "Fish" },
    { key: "5", value: "Bird" },
    { key: "6", value: "Rabbit" },
  ];
  const [breed, setBreed] = useState("");
  const [experiencelevel, setExperiencelevel] = useState("");
  const [fixedCharacteristics, setFixedCharacteristics] = useState([]);
  const characteristicsOptions = [
    { key: "1", value: "small" },
    { key: "2", value: "big" },
    { key: "3", value: "active" },
    { key: "4", value: "playful" },
    { key: "5", value: "disciplined" },
    { key: "6", value: "quiet" },
    { key: "7", value: "open to rescue animals" },
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user);
        fetchUserProfile(user.displayName || "");
      } else {
        console.log("User is not logged in");
        navigation.navigate("Login"); // Redirect to login page if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const fetchUserProfile = async (username) => {
    try {
      const userDocRef = doc(firestore, "userProfiles", username);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setImage(userData.imageUrl || "");
        setExperiencelevel(userData.experiencelevel || "");
        setBreed(userData.breed || "");
        setLocation(userData.location || "");
        setAnimalType(userData.animal || "");
        setFixedCharacteristics(userData.fixedCharacteristics || []);
      } else {
        console.log("No profile found!");
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  const validateFields = () => {
    if (
      !experiencelevel ||
      !location ||
      !animal ||
      !breed ||
      !fixedCharacteristics.length ||
      !image
    ) {
      Alert.alert("Error", "All fields must be filled.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      const imageUrl = await submitData(); // Get the image URL from submitData
      if (!imageUrl) {
        alert("Failed to upload image.");
        return;
      }
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // Update the user profile in Firebase Authentication
        await updateProfile(user, {
          photoURL: imageUrl,
        });

        // Log user profile to verify
        console.log("User displayName:", user.displayName);
        console.log("User photoURL:", user.photoURL);

        // Save the user profile to Firestore with username as document ID
        await setDoc(doc(firestore, "userProfiles", username), {
          uid: user.uid,
          username,
          experiencelevel,
          location,
          animal,
          breed,
          fixedCharacteristics,
          imageUrl,
        });

        alert("Profile saved successfully!");
        navigation.reset({
          index: 0,
          routes: [{ name: "PawfectMatch" }],
        });
      } else {
        alert("User not logged in");
      }
    } catch (error) {
      console.error("Error saving profile: ", error);
      alert("Error saving profile.");
    }
  };

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const submitData = async () => {
    if (image && username) {
      try {
        const fileName = username + image.substring(image.lastIndexOf("."));
        const storageRef = ref(storage, `userprofile/${fileName}`);
        const response = await fetch(image);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    } else {
      return null;
    }
  };

  return (
    <ImageBackground
      source={require("../ProfileStack/images/createprofilesbackground.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.customText}>Aspiring Pet Owners</Text>

          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={require("../ProfileStack/images/pickuserprofilephoto.png")}
              style={styles.imagebutton}
            />
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.image} />}

          <Text style={{ color: "white" }}> Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            editable={false} // Disable editing username
          />
          <Text style={{ color: "white" }}> Your experience level</Text>
          <TextInput
            style={styles.input}
            value={experiencelevel}
            onChangeText={setExperiencelevel}
          />

          <Text style={{ color: "white", marginTop: 10 }}> Breed Preference </Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={{ color: "white" }}> Where do you live?</Text>
          <SelectList
            setSelected={setLocation}
            data={locationOptions}
            save="value"
            placeholder="Select a location"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
            defaultOption={{ key: location, value: location }}
          />

          <Text style={{ color: "white", marginTop: 15 }}> Animal Type Preference </Text>
          <SelectList
            setSelected={setAnimalType}
            data={animalOptions}
            save="value"
            placeholder="Select an Animal Type"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
            defaultOption={{ key: animal, value: animal }}
          />

          <Text style={{ color: "white", marginTop: 10 }}> Characteristics you are looking for </Text>
          <MultipleSelectList
            setSelected={(val) => setFixedCharacteristics(val)}
            data={characteristicsOptions}
            save="value"
            label="Characteristics"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
            placeholderTextColor="white"
            defaultOptions={fixedCharacteristics.map((char) => ({
              key: char,
              value: char,
            }))}
          />
          <SafeAreaView style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../ProfileStack/images/gobackbutton.png")}
                style={{
                  width: 100,
                  height: 30,
                  alignItems: "center",
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Image
                source={require("../ProfileStack/images/saveprofilebutton.png")}
                style={{
                  width: 100,
                  height: 30,
                  alignItems: "center",
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 30,
    backgroundColor: "#5b4636",
  },
  uploadButton: {
    borderRadius: 5,
    width: 150,
    height: 50,
    backgroundColor: "#ffb6b9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectList: {
    backgroundColor: "lightbrown",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
    padding: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  inputStyles: {
    color: "white",
  },
  dropdownStyles: {
    backgroundColor: "lightbrown",
  },
  dropdownItemStyles: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  customText: {
    fontFamily: "Roxborough CF Bold",
    fontSize: 30,
    alignSelf: "center",
  },
  imagebutton: {
    width: 170,
    height: 50,
    alignSelf: "center",
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
  },
});