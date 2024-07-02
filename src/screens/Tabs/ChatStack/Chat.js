import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { firestore } from "../../../utils/firebase";
import { useNavigation } from "@react-navigation/core";

export default function Chat({ route }) {
  const chatPartner = route.params.profile;
  useEffect(() => {
    console.log("Chat partner:", chatPartner);
  }, [chatPartner]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);
  const [partnerPhoto, setPartnerPhoto] = useState(null);
  const [partnerUsername, setPartnerUsername] = useState(null);

  // get current username and profile photo
  const auth = getAuth();
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName);
      // Assuming profile photo is stored in Firebase Storage or another location
      // Replace 'photoURL' with your actual field containing profile photo URL
      setCurrentUserPhoto(user.photoURL);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // get chatPartner profile photo from userProfiles or petProfiles
  useEffect(() => {
    const fetchPartnerPhoto = async () => {
      try {
        // Check in userProfiles collection
        const userProfilesRef = doc(firestore, "userProfiles", chatPartner);
        const userProfilesSnap = await getDoc(userProfilesRef);
        if (userProfilesSnap.exists()) {
          setPartnerPhoto(userProfilesSnap.data().imageUrl);
          return;
        }

        // Check in petProfiles collection
        const petProfilesRef = doc(firestore, "petProfiles", chatPartner);
        const petProfilesSnap = await getDoc(petProfilesRef);
        if (petProfilesSnap.exists()) {
          setPartnerUsername(petProfilesSnap.data().username);
          setPartnerPhoto(petProfilesSnap.data().imageUrl);
          return;
        }

        console.log("Profile photo not found for chat partner:", chatPartner);
      } catch (error) {
        console.error("Error fetching profile photo for chat partner:", error);
      }
    };

    fetchPartnerPhoto();
  }, [chatPartner]);

  useEffect(() => {
    const chatDocId = [username, chatPartner].sort().join("_");
    const chatRef = collection(firestore, "messages", chatDocId, "chat");
    const q = query(chatRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatPartner, username]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const chatDocId = [username, chatPartner].sort().join("_");

    try {
      const docRef = await addDoc(
        collection(firestore, "messages", chatDocId, "chat"),
        {
          text: newMessage,
          sender: username, // Ensure this is correct
          timestamp: new Date(),
        }
      );

      console.log("Message sent successfully with ID:", docRef.id);

      setNewMessage(""); // Clear input field after sending message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.sender === username;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUser : styles.otherUser,
        ]}
      >
        {!isCurrentUser && partnerPhoto && (
          <Image source={{ uri: partnerPhoto }} style={styles.profileImage} />
        )}
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTimestamp}>
            {item.timestamp.toDate().toLocaleTimeString()}
          </Text>
        </View>
        {isCurrentUser && currentUserPhoto && (
          <Image
            source={{ uri: currentUserPhoto }}
            style={styles.profileImage}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../HomeStack/images/lightbrown.png")}
          style={styles.background}
        >
          <Image
            style={{ alignSelf: "center" }}
            source={require("../HomeStack/images/header.png")}
          />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../HomeStack/images/backbutton.png")}
                style={styles.backbutton}
              />
            </TouchableOpacity>

            <Image
              source={{ uri: partnerPhoto }}
              style={styles.profileImageTop}
            />
            <Text style={styles.usernameTop}>{partnerUsername} </Text>
          </View>

          <View
            style={{ height: 1, backgroundColor: "#7D5F26", marginTop: 10 }}
          />

          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#EDD7B5", // Adjust the color to match your app's theme
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  currentUser: {
    justifyContent: "flex-end",
  },
  otherUser: {
    justifyContent: "flex-start",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
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
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  profileImageTop: {
    width: 80,
    height: 80,
    borderRadius: 90,
    marginHorizontal: 5,
    marginLeft: 10,
    marginRight: 5,
    marginTop: 10,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    //alignItems: 'center',
  },
  backbutton: {
    alignSelf: "left",
    marginLeft: 5,
    marginTop: 10,
  },
  usernameTop: {
    fontSize: 30,
    //fontWeight: 'bold',
    marginLeft: 10,
  },
});
