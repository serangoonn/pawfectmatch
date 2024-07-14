import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  setDoc,
  doc,
  getDoc,
  arrayUnion,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import { firestore } from "../../../utils/firebase";
import { getAuth } from "firebase/auth";
import { Swipeable } from "react-native-gesture-handler";

const Home = () => {
  const navigation = useNavigation();
  const [starredPets, setStarredPets] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setCurrentUserPhoto(user.photoURL);

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetchStarredPets();
    }
  }, [username]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStarredPets();
    setRefreshing(false);
  };

  const fetchStarredPets = async () => {
    try {
      console.log("Fetching pets for username: ", username); // Debugging line
      if (username) {
        const docRef = doc(firestore, "StarPets", username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profiles = docSnap.data().profiles || {};
          const profilesArray = Object.keys(profiles).map((key) => ({
            ...profiles[key],
            id: key,
          }));
          setStarredPets(profilesArray);
        } else {
          console.log("No liked profiles found!");
        }
      } else {
        console.log("Username is not set yet.");
      }
    } catch (error) {
      console.error("Error fetching liked profiles: ", error);
    }
  };

  const handleDelete = async (pet) => {
    try {
      const docRef = doc(firestore, "StarPets", username);
      await updateDoc(docRef, {
        [`profiles.${pet.username}`]: deleteField(),
      });
      setStarredPets((prev) => prev.filter((item) => item.id !== pet.username));
    } catch (error) {
      console.error("Error deleting profile: ", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const filteredPets = starredPets.filter((pet) =>
    pet.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const refreshData = async () => {
    setRefreshing(true);
    await fetchStarredPets();
    setRefreshing(false);
  };

  const renderRightActions = (pet) => (
    <TouchableOpacity
      onPress={() => handleDelete(pet)}
      style={styles.deleteButton}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (pet) => (
    <TouchableOpacity
      onPress={() => handleConnect(pet)}
      style={styles.connectButton}
    >
      <Text style={styles.connectButtonText}>Connect</Text>
    </TouchableOpacity>
  );

  const handleConnect = async (pet) => {
    if (!username || !pet.username) return;

    try {
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

      // Update selected user contact list
      const petProfileRef = doc(firestore, "likedProfiles", pet.username);
      await setDoc(
        petProfileRef,
        {
          profiles: arrayUnion({
            username: username,
            imageUrl: currentUserPhoto || "",
          }),
        },
        { merge: true }
      );

      handleDelete(pet);
    } catch (error) {
      console.error("Error liking profile: ", error);
    }
  };

  return (
    <ImageBackground
      source={require("../HomeStack/images/lightbrown.png")}
      style={styles.background}
    >
      <Image source={require("../HomeStack/images/header.png")} />

      <TouchableOpacity onPress={() => navigation.push("Swipe")}>
        <Image
          source={require("../HomeStack/images/adoptnowbutton.png")}
          style={styles.imageButtonAdoptNow}
        />
      </TouchableOpacity>

      <Text
        style={{
          alignSelf: "center",
          marginTop: 25,
          fontSize: 20,
          color: "#7D5F26",
          fontWeight: "bold",
          marginBottom: 5,
        }}
      >
        Saved pets
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a pet..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={"#7D5F26"}
        />

        <TouchableOpacity onPress={refreshData}>
          <Image source={require("../ChatStack/images/refresh.png")} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            renderLeftActions={() => renderLeftActions(item)}
          >
            <View style={styles.profile}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.profileImage}
              />
              <View style={styles.information}>
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Text style={styles.header}>@{item.username}</Text>
                  <Image
                    source={require("../HomeStack/images/locationmarker.png")}
                    style={{
                      height: 15,
                      width: 10,
                      marginRight: 5,
                      marginLeft: 10,
                    }}
                  />
                  <Text style={styles.text}>{item.location}</Text>
                  <Image
                    source={require("../HomeStack/images/paw2.png")}
                    style={{
                      height: 12,
                      width: 12,
                      marginLeft: 10,
                      marginRight: 5,
                    }}
                  />
                  <Text style={styles.text}>
                    {item.animal}, {item.breed}
                  </Text>
                </View>
                <Text style={styles.header}>Learn more about me!</Text>
                <Text style={styles.text}>{item.description}</Text>
                {item.organization && (
                  <Text style={{ fontSize: 10, marginTop: 5, width: "100%" }}>
                    Organisation: {item.organization}
                  </Text>
                )}
                <View style={styles.characteristicsContainer}>
                  {Array.isArray(item.fixedcharacteristics) &&
                  item.fixedcharacteristics.length > 0 ? (
                    item.fixedcharacteristics.map((characteristic, index) => (
                      <View key={index} style={styles.characteristicBox}>
                        <Text style={styles.characteristicText}>
                          {characteristic}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.characteristicText}>-</Text>
                  )}
                </View>
              </View>
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={() => (
          <Text style={{ alignSelf: "center", marginTop: 20 }}>
            No saved pets found.
          </Text>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageButtonAdoptNow: {
    width: 330,
    height: 150,
    marginTop: 15,
    marginLeft: 15,
    borderRadius: 10,
  },
  petContainer: {
    backgroundColor: "#EDD7B5",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  petImage: {
    width: 160,
    height: 150,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 10,
  },
  accounts: {
    alignSelf: "flex-start",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    marginTop: 5,
  },
  information: {
    flexDirection: "column",
    //flexWrap: "wrap",
    maxWidth: "55%", // Adjust as needed
    marginRight: 70,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 90,
    marginRight: 20,
    marginLeft: 10,
  },
  text: {
    fontSize: 10,
    alignSelf: "flex-start",
  },
  header: {
    fontSize: 10,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
  deleteButton: {
    // marginLeft: 10,
    padding: 5,
    backgroundColor: "#7D5F26",
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  description: {
    fontSize: 12,
    flexWrap: "wrap",
    marginVertical: 2,
    width: "100%",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 5,
  },
  characteristicsContainer: {
    flexDirection: "row",
    //flexWrap: "wrap",
    marginTop: 10,
  },
  characteristicBox: {
    backgroundColor: "#A78D5C",
    borderRadius: 20,
    padding: 5,
    margin: 5,
    height: 23,
    alignItems: "center",
  },
  characteristicText: {
    color: "white", // Adjust the text color as needed
    alignSelf: "center",
    fontSize: 10,
  },
  searchBar: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#7D5F26",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
    backgroundColor: "#7D5F26",
    borderRadius: 5,
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "#fff",
  },
  connectButton: {
    padding: 5,
    backgroundColor: "#7D5F26",
    borderRadius: 5,
    alignSelf: "center",
  },
  connectButtonText: {
    color: "#fff",
  },
});
