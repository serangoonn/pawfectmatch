import { Image, ImageBackground, StyleSheet, Text, View, ScrollView, } from 'react-native';
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
      // Pass user profile data when navigating
      navigation.navigate('CreateUserProfile', {
        profile: {
          username,
          image,
          location,
          breed,
          animal,
          experiencelevel,
          characteristics
        }
      });
    } else {
      // Pass pet profile data when navigating
      navigation.navigate('CreatePetProfile', {
        profile: {
          petname,
          image,
          location,
          breed,
          description,
          animal,
          characteristics
        }
      });
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

  const handleGiveReview = () => {
    navigation.navigate('FeedbackRating');
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
      <ScrollView>
        <Text style={{fontFamily: 'Inknut Antiqua Regular', fontSize: 25, fontWeight: 'bold', color: '#7D5F26', marginLeft: 15, marginTop: 5}}>
          My Profile
        </Text>

        <View style={{flexDirection: 'row', justifyContent: 'left'}}>
          <Text style={{alignSelf: 'center', marginRight: 110, fontFamily: 'Inknut Antiqua Regular', fontSize: 30, fontWeight: 'bold', marginLeft: 15}}>
            @{username}
          </Text>
          {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
        </View>

        <View style={styles.textContainer}>
          {animal && (
            <Text>
              <Text style={styles.customBoldFont}>
                {isUserProfile ? "Type of Animal Preference: " : "Type of Animal: "}
              </Text>
              <Text style={styles.customFont}>{animal}</Text>
            </Text>
          )}
          {breed && (
            <Text>
              <Text style={styles.customBoldFont}>
                {isUserProfile ? "Breed Preference: " : "Breed: "}
              </Text>
              <Text style={styles.customFont}>{breed}</Text>
            </Text>
          )}
          {location && (
            <Text>
              <Text style={styles.customBoldFont}>Location: </Text>
              <Text style={styles.customFont}>{location}</Text>
            </Text>
          )}
          {experiencelevel && (
            <Text>
              <Text style={styles.customBoldFont}>Experience Level: </Text>
              <Text style={styles.customFont}>{experiencelevel}</Text>
            </Text>
          )}
        </View> 
        {characteristics.length > 0 ? (
          <View>
            <Text style={styles.customBoldFont}>
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
        <View style={styles.textContainer}>
          {petname ? (
            <Text>
              <Text style={styles.customBoldFont}>Pet Name: </Text>
              <Text style={styles.customFont}>{petname}</Text>
            </Text>
          ) : null}
          {description ? (
            <Text>
              <Text style={styles.customBoldFont}>Description: </Text>
              <Text style={styles.customFont}>{description}</Text>
            </Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleUpdateProfile} style={styles.buttons}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut} style={styles.buttons}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={{fontFamily: 'Inknut Antiqua Regular', fontSize: 18, fontWeight: 'bold', color: '#7D5F26', marginLeft: 15, marginTop: 10, lineHeight: 30}}>
          Found your pet / pet has been adopted?
        </Text>

        <TouchableOpacity onPress={handleDeleteProfile} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete Profile</Text>
        </TouchableOpacity>

        {isUserProfile && (
          <>
            <Text style={{fontFamily: 'Inknut Antiqua Regular', fontSize: 18, fontWeight: 'bold', color: '#7D5F26', marginLeft: 15, marginTop: 10, lineHeight: 30}}>
              Want to leave a review?
            </Text>

            <TouchableOpacity onPress={handleGiveReview} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Give Review</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  customFont: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Inknut Antiqua Regular',
    marginLeft: 10,
    textAlign: 'justify',
    lineHeight: 30,
    padding: 7,
  },
  customBoldFont: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Inknut Antiqua Regular',
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'justify',
    lineHeight: 30,
    padding: 7,
  },
  deleteButton: {
    backgroundColor: "#7D5F26",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "40%",
    marginLeft: 20,
    marginHorizonatal: 50, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    backgroundColor: "#7D5F26",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "90%",
    marginLeft: 20,
    marginHorizonatal: 50, 
    justifyContent: 'center',
    alignItems: 'center',  
  },
  buttonText: {
    color: "white",
    textAlign: 'center',
    fontFamily: 'Inknut Antiqua Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
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
    marginBottom: -5,
  },
  characteristicBox: {
    backgroundColor: '#A78D5C',
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  characteristicText: {
    color: '#EDD7B5',
    fontFamily: 'Inknut Antiqua Regular',
  },
  textContainer:  {
    padding: 10,
    marginLeft: 8,
    marginBottom: -17,
  },
});