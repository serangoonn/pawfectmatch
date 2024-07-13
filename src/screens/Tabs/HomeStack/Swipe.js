import React, { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  Image,
  ScrollView,
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
  const [feedback, setFeedback] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState([]);

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
    fetchFeedback();
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

  const fetchFeedback = async () => {
    try {
      const feedbackRef = collection(firestore, "feedback");
      const querySnapshot = await getDocs(feedbackRef);
      const feedbackData = {};
      querySnapshot.forEach((doc) => {
        const { organization } = doc.data();
        if (!feedbackData[organization]) {
          feedbackData[organization] = [];
        }
        feedbackData[organization].push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort feedback by createdAt if needed
      Object.keys(feedbackData).forEach((org) => {
        feedbackData[org].sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        );
      });
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback: ", error);
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
        // // Update exclusion list
        // const exclusionProfileRef = doc(firestore, "exclusion", username);
        // await setDoc(
        //   exclusionProfileRef,
        //   {
        //     [`${pet.username}`]: true,
        //   },
        //   { merge: true }
        // );

        // Get reference to current user's liked profiles document
        const currentUserLikedProfilesRef = doc(
          firestore,
          "StarPets",
          username
        );

        // Create a pet profile object
        const petProfile = {
          username: pet.username,
          imageUrl: pet.imageUrl,
          location: pet.location,
          breed: pet.breed,
          description: pet.description,
          animal: pet.animal,
        };

        // Update the user's liked profiles document
        await updateDoc(currentUserLikedProfilesRef, {
          [`profiles.${pet.username}`]: petProfile,
        });

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

  const FeedbackModal = ({ visible, feedback, onClose }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            {feedback.map((feedbackItem, index) => (
              <View key={index} style={styles.feedback}>
                <Text style={styles.feedbackText}>
                  Username: {feedbackItem.username}
                </Text>
                <Text style={styles.feedbackText}>
                  Rating: {feedbackItem.rating}
                </Text>
                <Text style={styles.feedbackText}>
                  Review: {feedbackItem.review}
                </Text>
                <Text style={styles.feedbackText}>
                  Created at:{" "}
                  {feedbackItem.createdAt?.toDate().toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );

  const moveToNextCard = () => {
    if (swiperRef.current && !scrollingFeedback) {
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
                  {feedback[pet.organization] &&
                    feedback[pet.organization].length > 0 && (
                      <TouchableOpacity
                        style={styles.feedbackButton}
                        onPress={() => {
                          setSelectedFeedback(feedback[pet.organization]);
                          setModalVisible(true);
                        }}
                      >
                        <Text style={styles.feedbackButtonText}>
                          View Feedback
                        </Text>
                      </TouchableOpacity>
                    )}
                  <FeedbackModal
                    visible={modalVisible}
                    feedback={selectedFeedback}
                    onClose={() => setModalVisible(false)}
                  />
                </View>
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
    marginTop: -50,
    width: 350,
    height: 460,
    borderRadius: 10,
    backgroundColor: "#5b4636",
    padding: 20,
  },
  text: {
    color: "white",
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
  feedbackContainer: {
    maxHeight: 400, // Adjust the maximum height as needed
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 10,
  },
  feedback: {
    marginBottom: 10,
  },
  feedbackText: {
    color: "black",
    fontSize: 10,
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
  feedbackButton: {
    backgroundColor: "#A78D5C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  feedbackButtonText: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
});
