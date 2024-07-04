import React, { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { useNavigation } from "@react-navigation/core";
import { firestore } from "../../../utils/firebase";
import {
  collection,
  setDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function Swipe() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [previousPets, setPreviousPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null); // Reference for Swiper component
  const [username, setUsername] = useState("");

  // Get the current user ID
  const auth = getAuth();
  const currentUser = auth.currentUser ? auth.currentUser.uid : null;

  // Refs to manage initial fetch
  const likedProfilesFetched = useRef(false);
  const starPetsFetched = useRef(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPetProfiles();
    fetchStarPets();
  }, []);

  const fetchPetProfiles = async () => {
    try {
      if (!likedProfilesFetched.current) {
        const petProfilesRef = collection(firestore, "petProfiles");
        const querySnapshot = await getDocs(petProfilesRef);
        const petsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsData);
        setLoading(false);
        likedProfilesFetched.current = true; // Set flag once fetched
      }
    } catch (error) {
      console.error("Error fetching pet profiles: ", error);
    }
  };

  const fetchStarPets = async () => {
    try {
      if (!starPetsFetched.current && username) {
        const starPetsRef = doc(firestore, "StarPets", username);
        const docSnap = await getDoc(starPetsRef);
        if (docSnap.exists()) {
          const starPetsData = docSnap.data().profiles;
          // Set starPets state if data exists
          // Example: setStarPets(starPetsData);
        }
        starPetsFetched.current = true; // Set flag once fetched
      }
    } catch (error) {
      console.error("Error fetching star pets: ", error);
    }
  };

  const getCurrentUsername = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return user.displayName || "";
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching current username:", error);
      return "";
    }
  };

  const handleLike = async (pet) => {
    if (pet && currentUser) {
      try {
        // Get current user's username
        const username = await getCurrentUsername();

        // Update current user's liked profiles
        const currentUserLikedProfilesRef = doc(
          firestore,
          "likedProfiles",
          currentUser
        );
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: arrayUnion({
              id: pet.id,
              username: pet.username,
              imageUrl: pet.imageUrl,
            }),
          },
          { merge: true }
        );

        // Update pet's contact list
        const petProfileRef = doc(firestore, "likedProfiles", pet.uid);
        await setDoc(
          petProfileRef,
          {
            profiles: arrayUnion({
              id: currentUser,
              username: username,
              imageUrl: pet.imageUrl || "",
            }),
          },
          { merge: true }
        );

        Alert.alert(
          "Like",
          "Do you want to message this user or continue swiping?",
          [
            {
              text: "Message",
              onPress: () => {
                navigation.navigate("ContactList");
                moveToNextCard();
              },
            },
            {
              text: "Continue",
              onPress: moveToNextCard, // Simplified to a function reference
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.error("Error liking profile: ", error);
      }
    }
  };

  const handleLikeSwiped = async (pet) => {
    if (pet && currentUser) {
      try {
        // Get current user's username
        const username = await getCurrentUsername();

        // Update current user's liked profiles
        const currentUserLikedProfilesRef = doc(
          firestore,
          "likedProfiles",
          currentUser
        );
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: arrayUnion({
              id: pet.id,
              username: pet.username,
              imageUrl: pet.imageUrl,
            }),
          },
          { merge: true }
        );

        // Update pet's contact list
        const petProfileRef = doc(firestore, "likedProfiles", pet.uid);
        await setDoc(
          petProfileRef,
          {
            profiles: arrayUnion({
              id: currentUser,
              username: username,
              imageUrl: pet.imageUrl || "",
            }),
          },
          { merge: true }
        );

        Alert.alert(
          "Like",
          "Do you want to message this user or continue swiping?",
          [
            {
              text: "Message",
              onPress: () => {
                navigation.navigate("ContactList");
              },
            },
            {
              text: "Continue",
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.error("Error star-ing profile: ", error);
      }
    }
  };

  const handleCancel = () => {
    if (swiperRef.current) {
      const currentPet = swiperRef.current.state.cardIndex;
      setPreviousPets((prevPets) => [...prevPets, pets[currentPet]]);
      moveToNextCard();
    }
  };

  const handleUndo = () => {
    if (previousPets.length > 0) {
      const lastPet = previousPets[previousPets.length - 1];
      setPreviousPets((prevState) => prevState.slice(0, -1));
      setPets((prevState) => [lastPet, ...prevState]);
    }
  };

  const handleStar = async (pet) => {
    Alert.alert("User Saved", "This pet profile has been saved!");
    if (pet && username) {
      try {
        // Get current user's username
        // Update current user's liked profiles
        const currentUserLikedProfilesRef = doc(
          firestore,
          "StarPets",
          username
        );
        const petProfile = {
          username: pet.username,
          imageUrl: pet.imageUrl,
          location: pet.location,
          breed: pet.breed,
          description: pet.description,
          animal: pet.animal,
        };
        await updateDoc(currentUserLikedProfilesRef, {
          [`profiles.${pet.username}`]: petProfile,
        });

        if (swiperRef.current) {
          swiperRef.current.swipeLeft();
        }
      } catch (error) {
        console.error("Error star-ing profile: ", error);
      }
    }
  };

  const moveToNextCard = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
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

      <View>
        <Swiper
          ref={swiperRef}
          cards={pets}
          renderCard={(pet) => (
            <View style={styles.card}>
              {pet && pet.imageUrl ? (
                <Image
                  source={{ uri: pet.imageUrl }}
                  style={styles.profileImage}
                />
              ) : null}
              {pet && (
                <>
                  <Text style={styles.text}>Username: {pet.username}</Text>
                  <Text style={styles.text}>Location: {pet.location}</Text>
                  <Text style={styles.text}>Animal: {pet.animal}</Text>
                  <Text style={styles.text}>Breed: {pet.breed}</Text>
                  <Text style={styles.text}>
                    Description: {pet.description}
                  </Text>
                </>
              )}
              <View style={styles.buttons}>
                <TouchableOpacity onPress={handleUndo}>
                  <Image
                    source={require("../HomeStack/images/undobutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Image
                    source={require("../HomeStack/images/cancelbutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLike(pet)}>
                  <Image
                    source={require("../HomeStack/images/likebutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStar(pet)}>
                  <Image
                    source={require("../HomeStack/images/starbutton.png")}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          onSwipedRight={(cardIndex) => handleLikeSwiped(pets[cardIndex])}
          onSwipedLeft={() => {
            handleCancel;
          }} // No operation needed here          cardIndex={0}
          backgroundColor="#f2f2f2"
          stackSize={3}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDD7B5",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    alignSelf: "center",
    width: 300,
    height: 400,
    borderRadius: 10,
    backgroundColor: "#5b4636",
    padding: 20,
  },
  text: {
    color: "white",
    marginBottom: 10,
  },
  profileImage: {
    width: 160,
    height: 150,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
