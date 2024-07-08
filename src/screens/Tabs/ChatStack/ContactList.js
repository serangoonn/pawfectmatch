import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ImageBackground,
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { firestore } from "../../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import MyTextInput from "@/src/components/MyTextInput";

export default function ContactList() {
  const [likedProfiles, setLikedProfiles] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedProfiles();
  }, [username]);

  const fetchLikedProfiles = async () => {
    if (!username) return;

    try {
      const docRef = doc(firestore, "likedProfiles", username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profiles = docSnap.data().profiles;
        // Ensure each profile has a unique key
        const uniqueProfiles = profiles.map((profile, index) => ({
          ...profile,
          key: profile.id || index.toString(),
        }));
        setLikedProfiles(uniqueProfiles);
      } else {
        console.log("No liked profiles found!");
      }
    } catch (error) {
      console.error("Error fetching liked profiles: ", error);
    }
  };

  const handleProfilePress = (profile) => {
    navigation.navigate("Chat", { profile });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchLikedProfiles();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../HomeStack/images/lightbrown.png")}
        style={styles.background}
      >
        <Image source={require("../HomeStack/images/header.png")} />

        <View style={styles.inputContainer}>
          <MyTextInput
            style={styles.input}
            placeholder={"Search for contact"}
            // onChange={}
          />
          <TouchableOpacity onPress={refreshData}>
            <Image source={require("../ChatStack/images/refresh.png")} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.accounts}
          data={likedProfiles}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProfilePress(item.username)}>
              <View style={styles.profile}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.profileImage}
                />
                <Text style={styles.username}>{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
          }
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
    marginLeft: 30,
  },
  username: {
    fontSize: 18,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  accounts: {
    alignSelf: "left",
  },
});
