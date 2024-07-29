import React, { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ScrollView,
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
  doc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DropDownPicker from "react-native-dropdown-picker";

export default function Swipe() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [previousPets, setPreviousPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const swiperRef = useRef(null);
  const [username, setUsername] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [items, setItems] = useState([]);
  // Get the current user ID
  const auth = getAuth();
  const currentUser = auth.currentUser ? auth.currentUser.uid : null;

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
  }, [selectedFilters]);

  useEffect(() => {
    // Fetch unique characteristics and locations for dropdowns
    const fetchCharacteristicsAndLocations = async () => {
      try {
        const petProfilesRef = collection(firestore, "petProfiles");
        const querySnapshot = await getDocs(petProfilesRef);
        const characteristics = new Set();
        const locations = new Set();
        querySnapshot.docs.forEach((doc) => {
          const pet = doc.data();
          if (pet.fixedCharacteristics) {
            pet.fixedCharacteristics.forEach((char) =>
              characteristics.add(char)
            );
          }
          if (pet.location) {
            locations.add(pet.location);
          }
        });
        setItems([
          ...[...characteristics].map((char) => ({
            label: char,
            value: `char_${char}`,
          })),
          ...[...locations].map((loc) => ({ label: loc, value: `loc_${loc}` })),
        ]);
      } catch (error) {
        console.error("Error fetching characteristics and locations: ", error);
      }
    };
    fetchCharacteristicsAndLocations();
  }, []);

  const fetchPetProfiles = async () => {
    try {
      const petProfilesRef = collection(firestore, "petProfiles");
      const querySnapshot = await getDocs(petProfilesRef);
      const petsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredPets = petsData.filter(
        (pet) =>
          selectedFilters.length === 0 ||
          selectedFilters.every((filter) => {
            if (filter.startsWith("char_")) {
              return (
                pet.fixedCharacteristics &&
                pet.fixedCharacteristics.includes(filter.replace("char_", ""))
              );
            } else if (filter.startsWith("loc_")) {
              return pet.location === filter.replace("loc_", "");
            }
            return false;
          })
      );

      setPets(filteredPets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pet profiles: ", error);
    }
  };

  const handleFilterChange = (value) => {
    setSelectedFilters(value);
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
          username
        );
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: arrayUnion({
              username: pet.username,
              imageUrl: pet.imageUrl,
            }),
          },
          { merge: true }
        );

        // Update pet's contact list
        const petProfileRef = doc(firestore, "likedProfiles", pet.username);
        await setDoc(
          petProfileRef,
          {
            profiles: arrayUnion({
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
          username
        );
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: arrayUnion({
              username: pet.username,
              imageUrl: pet.imageUrl,
            }),
          },
          { merge: true }
        );

        // Update pet's contact list
        const petProfileRef = doc(firestore, "likedProfiles", pet.username);
        await setDoc(
          petProfileRef,
          {
            profiles: arrayUnion({
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
      const currentPetIndex = swiperRef.current.state.cardIndex;
      setPreviousPets((prevPets) => [...prevPets, pets[currentPetIndex]]);
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
        // Get reference to current user's liked profiles document
        const currentUserLikedProfilesRef = doc(
          firestore,
          "StarPets",
          username
        );

        // Create the profile data
        const petProfile = {
          username: pet.username,
          imageUrl: pet.imageUrl,
          location: pet.location,
          breed: pet.breed,
          description: pet.description,
          animal: pet.animal,
          fixedCharacteristics: pet.fixedCharacteristics,
          organization: pet.organization,
        };

        // Update the document with the new profile using pet.username as the key
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: {
              [pet.username]: petProfile,
            },
          },
          { merge: true }
        );

        // Swipe left after saving the pet profile
        if (swiperRef.current) {
          swiperRef.current.swipeLeft();
        }
      } catch (error) {
        if (error.code === "not-found") {
          // Document doesn't exist, create a new one
          await setDoc(currentUserLikedProfilesRef, {
            profiles: {
              [pet.username]: petProfile,
            },
          });

          if (swiperRef.current) {
            swiperRef.current.swipeLeft();
          }
        } else {
          console.error("Error star-ing profile: ", error);
        }
      }
    }
  };

  const moveToNextCard = () => {
    if (swiperRef.current) {
      // to stop moving card
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

      <View style={styles.filtersContainer}>
        <DropDownPicker
          open={open}
          value={selectedFilters}
          items={items}
          setOpen={setOpen}
          setValue={handleFilterChange}
          placeholder="Select filter"
          multiple
          max={3}
          min={0}
          mode="BADGE"
          badgeDotColors={["#5b4636"]}
          badgeColors={["#EDD7B5"]}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      <View>
        <Swiper
          ref={swiperRef}
          cards={pets}
          renderCard={(pet) => (
            <View style={styles.card}>
              {pet && (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    alignSelf: "center",
                    marginBottom: 5,
                    color: "white",
                  }}
                >
                  @{pet.username}
                </Text>
              )}
              {pet && pet.imageUrl ? (
                <Image
                  source={{ uri: pet.imageUrl }}
                  style={styles.profileImage}
                />
              ) : null}
              {pet && (
                <View style={styles.petInfoContainer}>
                  <View style={{ flexDirection: "row", marginBottom: 5 }}>
                    <Image
                      source={require("../HomeStack/images/locationmarker.png")}
                      style={{ height: 20, width: 13, marginRight: 5 }}
                    />
                    <Text style={styles.text}>{pet.location}</Text>
                    <Image
                      source={require("../HomeStack/images/paw.png")}
                      style={{
                        height: 20,
                        width: 15,
                        marginLeft: 10,
                        marginRight: 5,
                      }}
                    />
                    <Text style={styles.text}>
                      {pet.animal}, {pet.breed}
                    </Text>
                  </View>
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Learn more about me!
                  </Text>
                  <Text style={styles.text}>{pet.description}</Text>
                  <View style={styles.characteristicsContainer}>
                    <Text style={styles.text}>
                      {Array.isArray(pet.fixedCharacteristics) &&
                      pet.fixedCharacteristics.length > 0 ? (
                        pet.fixedCharacteristics.map(
                          (characteristic, index) => (
                            <View key={index} style={styles.characteristicBox}>
                              <Text style={styles.characteristicText}>
                                {characteristic}
                              </Text>
                            </View>
                          )
                        )
                      ) : (
                        <Text style={styles.characteristicText}>-</Text>
                      )}
                    </Text>
                  </View>
                  {pet.organization && (
                    <Text style={styles.text}>
                      Organisation: {pet.organization}
                    </Text>
                  )}
                </View>
              )}
              <View style={styles.buttons}>
                <TouchableOpacity 
                  onPress={handleUndo}
                  testID="undoButton"
                >
                  <Image
                    source={require("../HomeStack/images/undobutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCancel}
                  testID="cancelButton"
                >
                  <Image
                    source={require("../HomeStack/images/cancelbutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleLike(pet)}
                  testID="heartButton"
                >
                  <Image
                    source={require("../HomeStack/images/likebutton.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleStar(pet)}
                  testID="starButton"
                >
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
          }} // No operation needed here cardIndex={0}
          backgroundColor="#f2f2f2"
          stackSize={3}
          verticalSwipe={false} // Disable vertical swiping
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  card: {
    marginTop: -50,
    width: 350,
    height: 420,
    borderRadius: 10,
    backgroundColor: "#5b4636",
    padding: 20,
    zIndex: 1,
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
  filtersContainer: {
    margin: 10,
    zIndex: 2,
    // flexDirection: "row",
    //justifyContent: "space-between",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: "#EDD7B5",
    borderColor: "#5b4636",
    borderRadius: 30,
  },
  dropdownContainer: {
    backgroundColor: "#EDD7B5",
    borderColor: "#5b4636",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backbutton: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
  text: {
    color: "white",
    fontSize: 12,
  },
  profileImage: {
    width: 160,
    height: 150,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  petInfoContainer: {
    flex: 1, // Take up remaining space in the card
    marginBottom: 10,
    marginTop: -10,
  },
  characteristicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  characteristicBox: {
    backgroundColor: "#A78D5C",
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  characteristicText: {
    color: "white", // Adjust the text color as needed
  },
});
