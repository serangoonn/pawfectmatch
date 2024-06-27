import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Image, Button, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../../../utils/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/core';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../utils/firebase';
import { auth } from '../../../utils/firebase';
import { getAuth } from "firebase/auth";

export default function Post() {
  const navigation = useNavigation();

  // State variables
  const [image, setImage] = useState('');
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
        const fetchedUsername = data.username; // Extract the username
        console.log('Username: ', fetchedUsername);
        setUsername(fetchedUsername); // Set the username state
        setLoading(false); // Set loading state to false
      } else {
        console.log('No such document for email:', email);
        setLoading(false); // Set loading state to false even if no document found
      }
    } catch (error) {
      console.error('Error fetching user data: ', error);
      setLoading(false); // Set loading state to false on error
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchUserData(user.email);
    }
  }, []);

  // Function to handle image pick from gallery
  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  // Function to submit data (image and caption) to Firebase
  const submitData = async () => {
    if (image && username && caption) {
      try {
        // Upload image to Firebase Storage
        const imageExtension = image.substring(image.lastIndexOf('.'));
        const fileName = `${username}-${new Date().getTime()}${imageExtension}`;
        const storageRef = ref(storage, `posts/${fileName}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        console.log('Image uploaded to Firebase storage');

        // Get download URL from Firebase Storage
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL: ', downloadURL);

        // Add post data to Firestore
        const postsCollectionRef = collection(firestore, 'posts');
        const docRef = await addDoc(postsCollectionRef, {
          username: username,
          imageUrl: downloadURL,
          caption: caption,
          createdAt: new Date(),
        });

        console.log('Post added to Firestore with ID: ', docRef.id);
        Alert.alert('Post Uploaded', 'Your post has been uploaded successfully!');
        
        // Reset form fields and image state
        setImage('');
        setCaption('');
      } catch (error) {
        console.error('Error adding document: ', error);
        Alert.alert('Error', 'Failed to upload post. Please try again later.');
      }
    } else {
      Alert.alert('Incomplete Fields', 'Please fill in all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Button onPress={handleImagePick} title="Pick Image" />

        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.noImageText}>No image selected</Text>
        )}

        <TextInput
          placeholder="Enter a caption"
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
        />

        <Button onPress={submitData} title="Post" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  noImageText: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
