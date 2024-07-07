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
} from "react-native";
import { firestore, auth } from "../../../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import { Swipeable } from "react-native-gesture-handler";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [profilephoto, setProfilephoto] = useState("");
  const [newComment, setNewComment] = useState("");

  const navigation = useNavigation();

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setProfilephoto(user.photoURL || "");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

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
          // User has not liked the post, so add their UID
          likes.push(user.uid);
        } else {
          // User has liked the post, so remove their UID
          likes.splice(userIndex, 1);
        }

        await updateDoc(postRef, { likes });
        fetchPosts(); // Refresh posts to reflect changes
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
        setNewComment(""); // Clear the comment input field
        fetchPosts(); // Refresh posts to reflect changes
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
      fetchPosts(); // Refresh posts to reflect changes
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(firestore, "posts", postId));
      fetchPosts(); // Refresh posts to reflect changes
    } catch (error) {
      console.error("Error deleting post:", error);
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
                  <Image
                    source={{ uri: item.profilephoto }}
                    style={styles.userPhoto}
                  />
                  <Text style={styles.username}>@{item.username}</Text>
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
                  <TouchableOpacity onPress={() => handleLike(item.id)}>
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
});
