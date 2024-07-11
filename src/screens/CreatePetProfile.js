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
import { useNavigation } from "@react-navigation/core";
import { firestore, storage } from "../utils/firebase";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";
import {
  SelectList,
  MultipleSelectList,
} from "react-native-dropdown-select-list";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";

export default function CreatePetProfile() {
  const navigation = useNavigation();

  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [petname, setPetName] = useState("");
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
  const [description, setDescription] = useState("");
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
  const [organization, setOrganization] = useState("");
  const organizationOptions = [
    { key: "1", value: "SPCA" },
    { key: "2", value: "The Animal Lodge" },
    { key: "3", value: "SOSD" },
    { key: "4", value: "Mercylight" },
    { key: "5", value: "NIL" },
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user);
      } else {
        console.log("User is not logged in");
        navigation.navigate("Login"); // Redirect to login page if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const validateFields = () => {
    if (
      !username ||
      !petname ||
      !location ||
      !animal ||
      !breed ||
      !description ||
      !fixedCharacteristics.length ||
      !organization ||
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
      const isUsernameAvailable = await checkUsernameAvailability();
      if (!isUsernameAvailable) {
        alert("Username is already taken.");
        return;
      }
    
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
          displayName: username,
          photoURL: imageUrl,
        });

        // Log user profile to verify
        console.log("User displayName:", user.displayName);
        console.log("User photoURL:", user.photoURL);

        // Save the user profile to Firestore with username as document ID
        try {
          await setDoc(doc(firestore, "petProfiles", username), {
            uid: user.uid,
            username,
            petname,
            location,
            animal,
            breed,
            description,
            fixedCharacteristics,
            organization,
            imageUrl,
          });
          console.log("Document successfully written!");
        } catch (error) {
          console.error("Error writing document: ", error);
        }

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

  const checkUsernameAvailability = async () => {
    try {
      const userProfilesRef = collection(firestore, "petProfiles");
      const querySnapshot = await getDocs(userProfilesRef);
      const existingUsernames = querySnapshot.docs.map(
        (doc) => doc.data().username
      );
      return !existingUsernames.includes(username);
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
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
        const storageRef = ref(storage, `petprofile/${fileName}`);
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
      source={require("../images/createprofilesbackground.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.customText}>Pets</Text>

          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={require("../images/pickpetimagebutton.png")}
              style={styles.imagebutton}
            />
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.image} />}
          <Text style={{ color: "white" }}> Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={{ color: "white" }}> Pet's Name</Text>
          <TextInput
            style={styles.input}
            value={petname}
            onChangeText={setPetName}
          />

          <Text style={{ color: "white" }}> Animal Type</Text>
          <SelectList
            setSelected={setAnimalType}
            data={animalOptions}
            save="value"
            placeholder="Select an Animal Type"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
          />

          <Text style={{ color: "white", marginTop: 15 }}> Breed </Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={{ color: "white" }}> Description of pet</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Include the age of your pet here."
            placeholderTextColor="white"
          />

          <Text style={{ color: "white" }}> Location</Text>
          <SelectList
            setSelected={(val) => setLocation(val)}
            data={locationOptions}
            save="value"
            placeholder="Select a location"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
          />

          <Text style={{ color: "white", marginTop: 15 }}>
            {" "}
            Characteristics of the pet{" "}
          </Text>
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
          />

          <Text style={{ color: "white" }}> Organisation</Text>
          <SelectList
            setSelected={(val) => setOrganization(val)}
            data={organizationOptions}
            save="value"
            placeholder="Select an organization"
            boxStyles={styles.selectList}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
          />

          <SafeAreaView style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../images/gobackbutton.png")}
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
                source={require("../images/saveprofilebutton.png")}
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
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  customText: {
    fontFamily: "Roxborough CF Bold",
    fontSize: 40,
    alignSelf: "center",
  },
  imagebutton: {
    width: 160,
    height: 50,
    alignSelf: "center",
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
  },
});
