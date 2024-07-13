import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { firestore, storage, auth } from "../../../utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { useNavigation } from "@react-navigation/core";

export default function Post() {
  const navigation = useNavigation();

  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [profilephoto, setProfilephoto] = useState("");

  // authenticate user
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName);
      setProfilephoto(user.photoURL);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // open gallery to select image
  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // uploads image onto Firebase storage
  const submitData = async () => {
    if (image && username && caption) {
      try {
        const uniqueId = Date.now().toString();
        const fileName =
          username + uniqueId + image.substring(image.lastIndexOf("."));
        const storageRef = ref(storage, `posts/${fileName}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytesResumable(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        const docRef = await addDoc(collection(firestore, "posts"), {
          username: username,
          imageUrl: downloadURL,
          caption: caption,
          createdAt: new Date(),
          profilephoto: profilephoto,
        });

        console.log("Document written with ID: ", docRef.id);

        // Navigate to Feed screen
        navigation.navigate("Feed");

        return downloadURL;
      } catch (error) {
        console.error("Error adding document: ", error);
        return null;
      }
    } else {
      console.log("Please fill in all fields");
      return null;
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#EDD7B5" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("../HomeStack/images/lightbrown.png")}
        style={styles.background}
      >
        <Image source={require("../HomeStack/images/header.png")} />
        <View style={styles.backbuttontext}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../HomeStack/images/backbutton.png")}
              style={styles.backbutton}
            />
          </TouchableOpacity>
          <Text style={styles.text}>Make a new post</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Button
              color="#866629"
              onPress={handleImagePick}
              title="Select a picture from your gallery:"
            />
            {image && <Image source={{ uri: image }} style={styles.image} />}
          </View>

          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>Caption:</Text>
            <TextInput
              placeholder="Type here..."
              style={styles.input}
              value={caption}
              onChangeText={setCaption}
            />
            <TouchableOpacity style={styles.postbutton} onPress={submitData}>
              <Text style={styles.posttext}>Post!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
    alignItems: "center",
  },
  backbutton: {
    marginRight: 10,
  },
  backbuttontext: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  text: {
    fontSize: 25,
    color: "#7D5F26",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 30,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#A78446",
  },
  postbutton: {
    backgroundColor: "#7D5F26",
    borderRadius: 30,
    width: 80,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  posttext: {
    color: "white",
    fontWeight: "bold",
  },
  captionContainer: {
    width: "100%",
    alignItems: "center",
  },
  captionText: {
    fontSize: 20,
    color: "#7D5F26",
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "left",
  },
});
