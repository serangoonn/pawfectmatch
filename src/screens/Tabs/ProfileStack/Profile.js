import { Image, ImageBackground, StyleSheet, Text, View, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/core';
import { firestore, storage, auth } from '../../../utils/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export default function Profile() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [petname, setPetname] = useState('');
  const [breed, setBreed] = useState('');
  const [description, setDescription] = useState('');
  const [animal, setAnimal] = useState('');
  const [experiencelevel, setExperiencelevel] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [isUserProfile, setIsUserProfile] = useState(true); 
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateProfile = () => {
    setIsEditing(true); // Set editing mode
    if (isUserProfile) {
      navigation.navigate('CreateUserProfile', { isEditing: true }); // Navigate to edit user profile
    } else {
      navigation.navigate('CreatePetProfile', { isEditing: true }); // Navigate to edit pet profile
    }
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch(error => alert(error.message));
  };

  const handleDeleteProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const username = user.displayName;
        if (isUserProfile) {
          await deleteDoc(doc(firestore, 'userProfiles', username));
        } else {
          await deleteDoc(doc(firestore, 'petProfiles', username));
        }
        navigation.replace('Login'); // Redirect to login after deletion
      }
    } catch (error) {
      console.error("Error deleting profile: ", error);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || '');
      fetchUserProfile(user.displayName || '');
    }
  }, []);

  const fetchUserProfile = async (username) => {
    try {
      console.log("Fetching profile for username: ", username);
      if (username) {
        const userDocRef = doc(firestore, 'userProfiles', username);
        const petDocRef = doc(firestore, 'petProfiles', username);

        const userDocSnap = await getDoc(userDocRef);
        const petDocSnap = await getDoc(petDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsUserProfile(true); // Set profile type to user
          setImage(userData.imageUrl || '');
          setExperiencelevel(userData.experiencelevel || '');
          setBreed(userData.breed || '');
          setLocation(userData.location || '');
          setAnimal(userData.animal || '');
          setCharacteristics(userData.fixedCharacteristics || '');
          setPetname(''); // Clear pet profile fields
          setDescription('');
        } else if (petDocSnap.exists()) {
          const petData = petDocSnap.data();
          setIsUserProfile(false); // Set profile type to pet
          setImage(petData.imageUrl || '');
          setPetname(petData.petname || '');
          setBreed(petData.breed || '');
          setDescription(petData.description || '');
          setLocation(petData.location || '');
          setAnimal(petData.animal || '');
          setCharacteristics(petData.fixedCharacteristics || '');
          setExperiencelevel(''); // Clear user profile fields
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
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >
      <Image 
        source={require('../HomeStack/images/header.png')}
        style={{alignSelf: 'center'}}
      />
      <View>
        <Text style={{fontSize: 25, fontWeight: 'bold', color: '#7D5F26', marginLeft: 5, marginTop: 5}}>
          My Profile
        </Text>

        <View style={{flexDirection: 'row', justifyContent: 'left'}}>
          <Text style={{alignSelf: 'center', marginRight: 110, fontSize: 30, fontWeight: 'bold', marginLeft: 10}}>
            @{username}
          </Text>
          {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
        </View>

        {experiencelevel ? (
          <Text>
            <Text style={styles.boldFont}>Experience Level:</Text>
            <Text style={styles.font}>{experiencelevel}</Text>          
          </Text>
        ) : null}
        {breed ? (
          <Text>
            <Text style={styles.boldFont}>Breed:</Text>
            <Text style={styles.font}>{breed}</Text>
          </Text>
        ) : null}
        {location ? (
          <Text>
            <Text style={styles.boldFont}>Location:</Text>
            <Text style={styles.font}>{location}</Text>
          </Text>
        ) : null}
        {animal ? (
          <Text>
            <Text style={styles.boldFont}>Animal:</Text>
            <Text style={styles.font}>{animal}</Text>
          </Text>
        ) : null}
        {characteristics.length > 0 ? (
          <View>
            <Text style={styles.boldFont}>
              {isUserProfile ? "Characteristics I'm looking for: " : "Characteristics I have: "}
            </Text>
            <View style={styles.characteristicsContainer}>
              {characteristics.map((item, index) => (
                <View key={index} style={styles.characteristicBox}>
                  <Text style={styles.characteristicText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {petname ? (
          <Text>
            <Text style={styles.boldFont}>Pet Name:</Text>
            <Text style={styles.font}>{petname}</Text>
          </Text>
        ) : null}
        {description ? (
          <Text>
            <Text style={styles.boldFont}>Description:</Text>
            <Text style={styles.font}>{description}</Text>
          </Text>
        ) : null}

        <TouchableOpacity onPress={handleUpdateProfile} style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#7D5F26', marginLeft: 10, marginTop: 10}}>
          Found your pet / pet has been adopted?
        </Text>

        <TouchableOpacity onPress={handleDeleteProfile} style={styles.button}>
          <Text style={styles.buttonText}>Delete Profile</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  font: {
    fontsize: 20,
    marginLeft: 10,
    padding: 7,
  },
  boldFont: {
    fontWeight: 'bold',
    marginLeft: 10,
    padding: 7,
  },
  button: {
    backgroundColor: "#7D5F26",
    padding: 10,
    borderRadius: 20,
    width: "30%",
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center"
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 90,
    marginVertical: 10,
  },
  background: {
    flex: 1,
  },
  characteristicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
  },
  characteristicBox: {
    backgroundColor: '#A78D5C',
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  characteristicText: {
    color: '#EDD7B5',
  },
});