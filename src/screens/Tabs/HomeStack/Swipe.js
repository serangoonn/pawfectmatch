import { Animated, PanResponder, Alert, ScrollView, ImageBackground, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from'@react-navigation/core';
import { firestore } from '../../../utils/firebase';
import { collection, setDoc, getDocs, doc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


export default function Swipe() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [previousUsers, setPreviousUsers] = useState([]);
  const position = useRef(new Animated.ValueXY()).current;
  const [pets, setPets] = useState([]);

  // Fetch all pet profiles and select a random pet
  useEffect(() => {
    fetchRandomPet();
  }, []);

  // Get the current user ID
  const auth = getAuth();
  const currentUser = auth.currentUser ? auth.currentUser.uid : null;


  const fetchRandomPet = async () => {
    try {
      const petProfilesRef = collection(firestore, 'petProfiles');
      const querySnapshot = await getDocs(petProfilesRef);
      const petsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out pets that have been swiped before
      const availablePets = petsData.filter(pet => !previousUsers.includes(pet.id));

      if (availablePets.length > 0) {
        const randomPet = availablePets[Math.floor(Math.random() * availablePets.length)];
        setUserData(randomPet);
        position.setValue({ x: 0, y: 0 });
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching pet profiles: ', error);
    }
  };

  const handleUndo = () => {
    if (previousUsers.length > 0) {
      const lastUserId = previousUsers.pop();
      const lastUser = pets.find(pet => pet.id === lastUserId);
      setPreviousUsers([...previousUsers]);
      setUserData(lastUser);
      position.setValue({ x: 0, y: 0 }); // Reset position
    }
  };

  const handleCancel = () => {
    if (userData) {
      setPreviousUsers([...previousUsers, userData.id]);
      fetchRandomPet();
    }
  };

  const getCurrentUsername = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return user.displayName || '';
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error fetching current username:', error);
      return '';
    }
  };
  

  const handleLike = async () => {
    if (userData && currentUser) {
      try {
        // Get current user's username
        const username = await getCurrentUsername();
  
        // Update current user's liked profiles
        const currentUserLikedProfilesRef = doc(firestore, 'likedProfiles', currentUser);
        await setDoc(
          currentUserLikedProfilesRef,
          {
            profiles: arrayUnion({
              id: userData.id,
              username: userData.username,
              imageUrl: userData.imageUrl,
            }),
          },
          { merge: true }
        );
  
        // Update pet's contact list (assuming it's stored under 'petProfiles')
        const petProfileRef = doc(firestore, 'likedProfiles', userData.uid);
        await setDoc(
          petProfileRef,
          {
            profiles: arrayUnion({
              id: currentUser,
              username: username,
              imageUrl: auth.currentUser.photoURL,
            }),
          },
          { merge: true }
        );
  
        Alert.alert(
          "Like",
          "Do you want to message this user or continue swiping?",
          [
            {
              text: "Message",
              onPress: () => console.log("Message pressed"),
            },
            {
              text: "Continue",
              onPress: () => {
                setPreviousUsers([...previousUsers, userData.id]);
                fetchRandomPet();
              },
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.error("Error liking profile: ", error);
      }
    }
  };
  
  
  
  

  const handleStar = () => {
    if (userData) {
      // Implement saving logic here
      Alert.alert('User Saved', 'This pet profile has been saved!');
    }
  };

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: new Animated.Value(0) }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(position, {
            toValue: { x: 500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            handleLike();
            position.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(position, {
            toValue: { x: -500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            handleCancel();
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <ImageBackground 
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >

      <Image 
        source={require('../HomeStack/images/header.png')}
      />

      <TouchableOpacity 
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../HomeStack/images/backbutton.png')}
          style={styles.backbutton}
        />
      </TouchableOpacity>

      <View style={styles.containerWrapper}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.container, { transform: position.getTranslateTransform() }]}
        >
          <ScrollView>
            {userData ? (
              <View>
                {userData.imageUrl ? (
                  <Image source={{ uri: userData.imageUrl }} style={styles.profileImage} />
                ) : null}
                <Text style={styles.text}>Username: {userData.username}</Text>
                <Text style={styles.text}>Location: {userData.location}</Text>
                <Text style={styles.text}>Animal: {userData.animal}</Text>
                <Text style={styles.text}>Breed: {userData.breed}</Text>
                <Text style={styles.text}>Description: {userData.description}</Text>
                {/* Add more fields as needed */}
              </View>
            ) : (
              <Text style={styles.text}>No more pets to show.</Text>
            )}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleUndo}>
              <Image source={require('../HomeStack/images/undobutton.png')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel}>
              <Image source={require('../HomeStack/images/cancelbutton.png')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLike}>
              <Image source={require('../HomeStack/images/likebutton.png')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStar}>
              <Image source={require('../HomeStack/images/starbutton.png')} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backbutton: {
    alignSelf: 'left',
    marginLeft: 20,
    marginTop: 10,           
  },
  background: {
    flex: 1,
    alignSelf: 'center',
  },
  containerWrapper: {
    flex: 1,
    marginTop: 20,
    width: 300,
    alignSelf: 'center',
  },
  container: {
    flex: 0.8,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 30,
    backgroundColor: '#5b4636',
    width :300,
    alignSelf: 'center',
  },
  text: {
    color: 'white',
    marginBottom: 10,
  },
  profileImage: {
    width: 160,
    height: 150,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
