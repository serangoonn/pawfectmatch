import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Image, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage, auth } from '../../../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/core';

export default function Post() {
  // Navigation
  const navigation = useNavigation();

  // State variables
  const [image, setImage] = useState('');
  const [username, setUsername] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || '');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Open gallery to select image
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

  // Uploads image onto Firebase storage
  const submitData = async () => {
    if (image && username && caption) {
      try {
        const uniqueId = Date.now().toString(); // Generate a unique ID using the current timestamp
        const fileName = username + uniqueId + image.substring(image.lastIndexOf('.'));
        const storageRef = ref(storage, `posts/${fileName}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        const docRef = await addDoc(collection(firestore, 'posts'), {
          username: username,
          imageUrl: downloadURL,
          caption: caption,
          createdAt: new Date(),
        });

        console.log('Document written with ID: ', docRef.id);
        
        // Navigate to Feed screen
        navigation.navigate('Feed');
        
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
        <Button onPress={handleImagePick} title="Pick Image" />
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TextInput
          placeholder="Enter a caption"
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
        />
        <Button onPress={submitData} title="Post!" />
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
