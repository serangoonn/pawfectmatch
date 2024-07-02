import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Button,
  RefreshControl,
} from "react-native";
import { firestore, storage, auth } from "../../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import { getDownloadURL, ref } from "firebase/storage";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "posts"));
      const postsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let photoURL = "";

          // Determine where to fetch photoURL based on data structure
          if (data.userType === "pet") {
            // Fetch from petprofile
            const petProfileRef = doc(firestore, "petProfiles", data.username);
            const petProfileSnap = await getDoc(petProfileRef);
            if (petProfileSnap.exists()) {
              photoURL = petProfileSnap.data().imageUrl;
            } else {
              console.log(`No pet profile found for username ${data.username}`);
              // You can set a default photoURL or handle as needed
            }
          } else {
            // Fetch from userprofile (assuming userprofile contains photoURL)
            photoURL = data.photoURL; // Adjust this based on your actual data structure
          }

          return { id: doc.id, ...data, photoURL };
        })
      );
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <ImageBackground
      source={require("../HomeStack/images/lightbrown.png")}
      style={styles.background}
    >
      <Image source={require("../HomeStack/images/header.png")} />
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.post}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: item.photoURL }}
                  style={styles.userPhoto}
                />
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <Text style={styles.caption}>{item.caption}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <TouchableOpacity onPress={() => navigation.push("Post")}>
          <Image
            source={require("../Social Stack/images/uploadbutton.png")}
            style={styles.imagebutton}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  post: {
    marginBottom: 20,
    width: 300,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 20,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  caption: {
    marginLeft: 15,
    marginTop: 5,
    fontWeight: "bold",
  },
  username: {
    fontWeight: "bold",
  },
  imagebutton: {
    height: 50,
    width: 50,
    alignSelf: "center",
    marginTop: 5,
  },
});
