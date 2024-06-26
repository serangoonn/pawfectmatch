import React, { useState, useEffect } from 'react'
import { ScrollView, ImageBackground, StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, Button } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../../../utils/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from'@react-navigation/core';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../utils/firebase';
import { auth } from '../../../utils/firebase';
import { getAuth } from "firebase/auth";

export default function Post () {
  // navigation
  const navigation = useNavigation();

  // upload images onto firebase storage
  const [image, setImage] = useState('');

  // user information
  const [username, setUsername] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's data
  const fetchUserData = async (email) => {
  try {
    const userDoc = doc(firestore, 'petProfiles', email);
    const docSnapshot = await getDoc(userDoc);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const username = data.username; // Extract the username
      console.log('Username: ', username);
      setUsername(username); // Set the username state
      return username;
    } else {
      console.log('No such document for email:', email);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data: ', error);
    return null;
  }
};

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchUserData(user.email).then(() => setLoading(false));
    }
  }, []);

  // open gallery to select image
  const handleImagePick = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // uploads image onto firebase storage
  const submitData = async () => {
    if (image && username && caption) {
      try {
        const fileName = username + image.substring(image.lastIndexOf('.'));
        const storageRef = ref(storage, `posts/${fileName}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        console.log('Image uploaded to Firebase storage');

        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL: ', downloadURL);

        const docRef = await addDoc(collection(firestore, 'posts'), {
          username: username,
          imageUrl: downloadURL,
          caption: caption,
          createdAt: new Date(),
        });
        console.log('Document written with ID: ', docRef.id);
        return downloadURL;
      } catch (error) {
        console.error('Error adding document: ', error);
        return null;
      }
    } else {
      console.log('Please fill in all fields');
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
<ScrollView>

<Button
  onPress={handleImagePick}
  title="Pick Image"
/>

{image && <Image source={{ uri: image }} style={styles.image} />}

<TextInput
          placeholder="Enter a caption"
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
        />

<Button
  onPress={submitData}
  title="post!"
/>


</ScrollView>


</View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
});
