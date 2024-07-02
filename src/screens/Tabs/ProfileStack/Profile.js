import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/core";
import { firestore, storage, auth } from "../../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [petname, setPetname] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [animal, setAnimal] = useState("");
  const [experiencelevel, setExperiencelevel] = useState("");
  const [characteristics, setCharacteristics] = useState("");

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

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
        const petDocRef = doc(firestore, "petProfiles", username);

        const userDocSnap = await getDoc(userDocRef);
        const petDocSnap = await getDoc(petDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setImage(userData.imageUrl || "");
          setExperiencelevel(userData.experiencelevel || "");
          setBreed(userData.breed || "");
          setLocation(userData.location || "");
          setAnimal(userData.animal || "");
          setCharacteristics(userData.fixedCharacteristics || "");
          setPetname(""); // Clear pet profile fields
          setDescription("");
        } else if (petDocSnap.exists()) {
          const petData = petDocSnap.data();
          setImage(petData.imageUrl || "");
          setPetname(petData.petname || "");
          setBreed(petData.breed || "");
          setDescription(petData.description || "");
          setLocation(petData.location || "");
          setAnimal(petData.animal || "");
          setCharacteristics(petData.fixedCharacteristics || "");
          setExperiencelevel(""); // Clear user profile fields
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

  return (
    <ImageBackground
      source={require("../HomeStack/images/lightbrown.png")}
      style={styles.background}
    >
      <Image
        source={require("../HomeStack/images/header.png")}
        style={{ alignSelf: "center" }}
      />
      <View>
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            color: "#7D5F26",
            marginLeft: 5,
            marginTop: 5,
          }}
        >
          My Profile
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "left" }}>
          <Text
            style={{
              alignSelf: "center",
              marginRight: 110,
              fontSize: 30,
              marginLeft: 10,
            }}
          >
            @{username}
          </Text>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : null}
        </View>

        {experiencelevel ? (
          <Text style={styles.font}>Experience Level: {experiencelevel}</Text>
        ) : null}
        {breed ? <Text style={styles.font}>Breed: {breed}</Text> : null}
        {location ? (
          <Text style={styles.font}>Location: {location}</Text>
        ) : null}
        {animal ? <Text style={styles.font}>Animal: {animal}</Text> : null}
        {characteristics ? (
          <Text style={styles.font}>Characteristics: {characteristics}</Text>
        ) : null}
        {petname ? <Text style={styles.font}>Pet Name: {petname}</Text> : null}
        {description ? (
          <Text style={styles.font}>Description: {description}</Text>
        ) : null}

        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  font: {
    fontsize: 20,
    marginLeft: 10,
    padding: 5,
  },
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 20,
    width: "60%",
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 90,
    marginVertical: 10,
  },
  background: {
    flex: 1,
  },
});

/*  <Text style={styles.font}>Experience Level: {experiencelevel}</Text>
    <Text style={styles.font}>Breed: {breed}</Text>
    <Text style={styles.font}>Location: {location}</Text>
    <Text style={styles.font}>Animal: {animal}</Text>
    <Text style={styles.font}>Characteristics: {fixedCharacteristics}</Text>
    {petname ? <Text style={styles.font}>Pet Name: {petname}</Text> : null}
    {description ? <Text style={styles.font}>Description: {description}</Text> : null}  */
