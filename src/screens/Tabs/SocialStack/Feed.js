import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { firestore } from "../../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  arrayRemove,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import { Swipeable } from "react-native-gesture-handler";
import { getAuth } from "firebase/auth";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // pop up profile information
  const [profileusername, setProfileusername] = useState("");
  const [location, setLocation] = useState("");
  const [petname, setPetname] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [animal, setAnimal] = useState("");
  const [experiencelevel, setExperiencelevel] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [isUserProfile, setIsUserProfile] = useState(true);
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);

  const navigation = useNavigation();

  // get current username and profile photo
  const auth = getAuth();
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName);
      setCurrentUserPhoto(user.photoURL);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "posts"));
      const postsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          return { id: doc.id, ...data };
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

  const handleLike = async (postId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const postRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const likes = postData.likes || [];
        const userIndex = likes.indexOf(user.uid);

        if (userIndex === -1) {
          likes.push(user.uid);
        } else {
          likes.splice(userIndex, 1);
        }

        await updateDoc(postRef, { likes });
        fetchPosts();
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const postRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const comments = postData.comments || [];

        const newCommentData = {
          username: user.displayName,
          text: newComment,
          createdAt: new Date(),
        };

        comments.push(newCommentData);

        await updateDoc(postRef, { comments });
        setNewComment("");
        fetchPosts();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (postId, comment) => {
    try {
      const postRef = doc(firestore, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayRemove(comment),
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(firestore, "posts", postId));
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // user is the profile current user tapped
  const handleUserPress = async (user) => {
    setSelectedUser(user);
    setProfileusername(user.username);
    setModalLoading(true);
    await fetchUserProfile(user.username);
    setModalLoading(false);
    setModalVisible(true);
  };

  // currentUser is user currently logged in (username)
  // selectedUser is user selected (profileusername)
  const handleConnect = async (profileusername) => {
    if (!username || !profileusername) return;

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
            username: profileusername,
            imageUrl: selectedUser.profilephoto,
          }),
        },
        { merge: true }
      );

      // Update selected user contact list
      const petProfileRef = doc(firestore, "likedProfiles", profileusername);
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
    } catch (error) {
      console.error("Error liking profile: ", error);
    }
    setModalVisible(!modalVisible);
  };

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

          setIsUserProfile(true);
          setExperiencelevel(userData.experiencelevel || "");
          setBreed(userData.breed || "");
          setLocation(userData.location || "");
          setAnimal(userData.animal || "");
          setCharacteristics(userData.fixedCharacteristics || []);
          setPetname("");
          setDescription("");
        } else if (petDocSnap.exists()) {
          const petData = petDocSnap.data();
          setIsUserProfile(false);
          setPetname(petData.petname || "");
          setBreed(petData.breed || "");
          setDescription(petData.description || "");
          setLocation(petData.location || "");
          setAnimal(petData.animal || "");
          setCharacteristics(petData.fixedCharacteristics || []);
          setExperiencelevel("");
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
      <Image source={require("../HomeStack/images/header.png")} />
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const userLiked = item.likes?.includes(auth.currentUser?.uid);

            return (
              <View style={styles.post}>
                <View style={styles.userInfo}>
                  <TouchableOpacity onPress={() => handleUserPress(item)}>
                    <Image
                      source={{ uri: item.profilephoto }}
                      style={styles.userPhoto}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUserPress(item)}>
                    <Text style={styles.username}>@{item.username}</Text>
                  </TouchableOpacity>
                  {auth.currentUser?.displayName === item.username && (
                    <TouchableOpacity
                      onPress={() => handleDeletePost(item.id)}
                      style={styles.deletePostButton}
                    >
                      <Text style={styles.deletePostButtonText}>
                        Delete Post
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.likeContainer}>
                  <TouchableOpacity 
                    onPress={() => handleLike(item.id)}
                    testID={`like-button-${item.id}`}
                  >
                    <Image
                      source={
                        userLiked
                          ? require("../SocialStack/images/heartliked.png")
                          : require("../SocialStack/images/heartnotliked.png")
                      }
                      style={styles.likeButton}
                    />
                  </TouchableOpacity>
                  <Text>{item.likes?.length || 0} likes</Text>
                </View>
                <Text style={styles.caption}>
                  {item.username}: {item.caption}
                </Text>
                <FlatList
                  data={item.comments || []}
                  keyExtractor={(comment, index) => index.toString()}
                  renderItem={({ item: comment }) => (
                    <Swipeable
                      renderRightActions={() =>
                        auth.currentUser?.displayName === comment.username ? (
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteComment(item.id, comment)
                            }
                          >
                            <Text>Delete</Text>
                          </TouchableOpacity>
                        ) : null
                      }
                    >
                      <View style={styles.comment}>
                        <Text style={styles.commentUsername}>
                          {comment.username}:
                        </Text>
                        <Text> {comment.text}</Text>
                      </View>
                    </Swipeable>
                  )}
                />
                <View style={styles.commentInputContainer}>
                  <TextInput
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                    style={styles.commentInput}
                    placeholderTextColor={"#7D5F26"}
                  />
                  <TouchableOpacity
                    onPress={() => handleAddComment(item.id)}
                    testID={`post-comment-button-${item.id}`}
                    style={[
                      styles.commentButton,
                      !newComment && styles.commentButtonDisabled,
                    ]}
                    disabled={!newComment}
                  >
                    <Text
                      style={[
                        styles.commentButtonText,
                        !newComment && styles.commentButtonTextDisabled,
                      ]}
                    >
                      Post
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <TouchableOpacity onPress={() => navigation.push("Post")}>
          <Image
            source={require("../SocialStack/images/uploadbutton.png")}
            style={styles.imagebutton}
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {modalLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              selectedUser && (
                <>
                  {isUserProfile ? (
                    <>
                      <Text style={styles.profileText}>@{profileusername}</Text>
                      <Image
                        source={{ uri: selectedUser.profilephoto }}
                        style={styles.profilephoto}
                      />
                      <View style={{ flexDirection: "row", marginBottom: 5 }}>
                        <Image
                          source={require("../HomeStack/images/locationmarker.png")}
                          style={{ height: 20, width: 13, marginRight: 5 }}
                        />
                        <Text style={styles.text}>{location}</Text>
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
                          {animal}, {breed}
                        </Text>
                      </View>
                      <Text
                        style={{
                          alignSelf: "left",
                          color: "white",
                          marginTop: 5,
                          fontWeight: "bold",
                        }}
                      >
                        Experience level: {experiencelevel}
                      </Text>
                      <Text
                        style={{
                          alignSelf: "left",
                          color: "white",
                          marginTop: 5,
                          fontWeight: "bold",
                        }}
                      >
                        Characteristics:
                      </Text>

                      <View style={styles.characteristicsContainer}>
                        <Text style={styles.text}>
                          {Array.isArray(characteristics) &&
                          characteristics.length > 0 ? (
                            characteristics.map((characteristic, index) => (
                              <View
                                key={index}
                                style={styles.characteristicBox}
                              >
                                <Text style={styles.characteristicText}>
                                  {characteristic}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.characteristicText}>-</Text>
                          )}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.profileText}>
                        @{profileusername} ({petname})
                      </Text>
                      <Image
                        source={{ uri: selectedUser.profilephoto }}
                        style={styles.profilephoto}
                      />

                      <View style={{ flexDirection: "row", marginBottom: 5 }}>
                        <Image
                          source={require("../HomeStack/images/locationmarker.png")}
                          style={{ height: 20, width: 13, marginRight: 5 }}
                        />
                        <Text style={styles.text}>{location}</Text>
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
                          {animal}, {breed}
                        </Text>
                      </View>
                      <Text
                        style={{
                          alignSelf: "left",
                          color: "white",
                          marginTop: 5,
                          fontWeight: "bold",
                        }}
                      >
                        Characteristics:
                      </Text>
                      <View style={styles.characteristicsContainer}>
                        <Text style={styles.text}>
                          {Array.isArray(characteristics) &&
                          characteristics.length > 0 ? (
                            characteristics.map((characteristic, index) => (
                              <View
                                key={index}
                                style={styles.characteristicBox}
                              >
                                <Text style={styles.characteristicText}>
                                  {characteristic}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.characteristicText}>-</Text>
                          )}
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: "white",
                          alignSelf: "left",
                          fontWeight: "bold",
                        }}
                      >
                        Description:
                      </Text>

                      <Text
                        style={{
                          color: "white",
                          alignSelf: "left",
                          marginTop: 3,
                        }}
                      >
                        {description}
                      </Text>
                    </>
                  )}
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => handleConnect(profileusername)}
                    >
                      <Text style={styles.closeButtonText}>Connect</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  post: {
    marginBottom: 50,
    width: 300,
  },
  image: {
    width: "100%",
    height: 250,
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
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  likeButton: {
    width: 21,
    height: 20,
    marginLeft: 15,
  },
  imagebutton: {
    height: 50,
    width: 50,
    alignSelf: "center",
    marginTop: 5,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#7D5F26",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#7D5F26",
    borderRadius: 20,
    padding: 10,
  },
  commentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  commentUsername: {
    fontWeight: "bold",
    marginLeft: 15,
  },
  deletePostButton: {
    marginLeft: "auto",
    backgroundColor: "#7D5F26",
    padding: 5,
    borderRadius: 5,
  },
  deletePostButtonText: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "#5E471C",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
  closeButton: {
    backgroundColor: "#EDD7B5",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
  },
  closeButtonText: {
    color: "#7D5F26",
    fontWeight: "bold",
  },
  profileText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  profilephoto: {
    width: 150,
    height: 150,
    borderRadius: 90,
    marginBottom: 10,
  },
  text: {
    color: "white",
  },
  characteristicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    alignSelf: "left",
  },
  characteristicBox: {
    backgroundColor: "#A78D5C",
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  characteristicText: {
    color: "white",
  },
});
