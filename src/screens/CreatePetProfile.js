// custom text font not working yet

import { Alert, ScrollView, ImageBackground, StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, Button } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from'@react-navigation/core';
import { firestore } from "../utils/firebase"
import { collection, addDoc, getDocs, doc } from 'firebase/firestore';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list'
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePetProfile () {
    // navigation
    const navigation = useNavigation();

    // upload images onto firebase storage
    const [image, setImage] = useState('');

    // user information
    const [username, setUsername] = useState('');
    const [petname, setPetName] = useState('');
    const [location, setLocation] = useState('');
    const locationOptions = [
        {key:'1', value:'North Region'},
        {key:'2', value:'North East Region'},
        {key:'3', value:'East Region'},
        {key:'4', value:'Central Region'},
        {key:'5', value:'West Region'},
    ];
    const [animal, setAnimalType] = useState("");
    const animalOptions = [
        {key:'1', value:'Dog'},
        {key:'2', value:'Cat'},
        {key:'3', value:'Hamster'},
        {key:'4', value:'Fish'},
        {key:'5', value:'Bird'},
        {key:'6', value:'Rabbit'},
    ];

    const [breed, setBreed] = useState('');
    const [description, setDescription] = useState('');
    const [fixedCharacteristics, setFixedCharacteristics] = useState([]);
    const characteristicsOptions = [
        {key:'1', value:'small'},
        {key:'2', value:'big'},
        {key:'3', value:'active'},
        {key:'4', value:'playful'},
        {key:'5', value:'disciplined'},
        {key:'6', value:'quiet'},
        {key:'7', value:'open to rescue animals'},
    ];

    // error if a field is not filled in
    const validateFields = () => {
      if (!username || !petname || !location || !animal || !breed || !description || !fixedCharacteristics.length || !image) {
          Alert.alert("Error", "All fields must be filled.");
          return false;
      }
      return true;
  };

    // save user information
    const handleSave = async () => {
      if (!validateFields()) return;
      try {
          const isUsernameAvailable = await checkUsernameAvailability();
          if (isUsernameAvailable) {
              const imageUrl = await submitData(); // Get the image URL from submitData
              await addDoc(collection(firestore, 'petProfiles'),{
                username,
                  location,
                  animal,
                  breed,
                  description,
                  fixedCharacteristics,
                  imageUrl, 
              });
              alert('Profile saved successfully!');
              navigation.reset({
                  index: 0,
                  routes: [{ name: "PawfectMatch" }],
              });
          } else {
              alert('Error saving profile or Username is already taken.');
          }
      } catch (error) {
          console.error("Error saving profile: ", error);
          alert('Error saving profile or Username is already taken.');
      }
  };
  
    // check if username is available
    const checkUsernameAvailability = async () => {
        const userProfilesRef = collection(firestore, 'userProfiles');
        const querySnapshot = await getDocs(userProfilesRef);
        const existingUsernames = querySnapshot.docs.map(doc => doc.data().username);
        return !existingUsernames.includes(username);
    };

    // open gallery to select image
    const handleImagePick = async () => {
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
      if (image && username) {
          const fileName = username + image.substring(image.lastIndexOf('.'));
          const storageRef = ref(storage, `petprofile/${fileName}`);
          const response = await fetch(image);
          const blob = await response.blob();
  
          await uploadBytes(storageRef, blob);
          console.log('Image uploaded to Firebase storage');
          const downloadURL = await getDownloadURL(storageRef);
          //console.log('Download URL: ', downloadURL);
          return downloadURL;
      } else {
          console.log('No image selected');
          return null;
      }
  };
  
  

    return (
      <ImageBackground
      source={require('../images/createprofilesbackground.png')}
      style={styles.background}
    >

      <View style={styles.container}>
      <ScrollView>

        <Text style={styles.customText}>
          Pets
        </Text>

        <TouchableOpacity 
          onPress={handleImagePick}>
            <Image
              source={require('../images/pickpetimagebutton.png')}
              style={styles.imagebutton}
              />
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.image} />}

            <Text style={{color: 'white'}}> Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
            />

            <Text style={{color: 'white'}}> Pet's Name</Text>
            <TextInput
                style={styles.input}
                value={petname}
                onChangeText={setPetName}
            />

            <Text style={{color: 'white'}}> Location</Text>
            <SelectList
           setSelected={setLocation}
           data={locationOptions}
           save="value"
           placeholder="Select a location"
           boxStyles={styles.selectList} 
           inputStyles={styles.inputStyles} 
           dropdownStyles={styles.dropdownStyles} 
           dropdownItemStyles={styles.dropdownItemStyles} 
           />

            <Text style={{color: 'white', marginTop:15}}> Animal Type</Text>
            <SelectList 
            setSelected = {setAnimalType} 
            data={animalOptions} 
            save="value"
            placeholder="Select an Animal Type"
            boxStyles={styles.selectList} 
            inputStyles={styles.inputStyles} 
            dropdownStyles={styles.dropdownStyles} 
            dropdownItemStyles={styles.dropdownItemStyles} 
           />

            <Text style={{color: 'white', marginTop: 10}}> Breed </Text>
            <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
            />

            <Text style={{color: 'white'}}> Description of pet</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Include the age of your pet here."
                placeholderTextColor="white" 
            />

            <Text style={{color: 'white'}}> Characteristics of the pet </Text>
            <MultipleSelectList 
            setSelected={(val) => setFixedCharacteristics(val)} 
            data={characteristicsOptions} 
            save="value"
            label="Characteristics"
            boxStyles={styles.selectList} 
            inputStyles={styles.inputStyles} 
            dropdownStyles={styles.dropdownStyles} 
            dropdownItemStyles={styles.dropdownItemStyles} 
            placeholderTextColor="white" 
            />
          <SafeAreaView style={styles.buttonContainer}>
          <TouchableOpacity 
          onPress={() => navigation.goBack()}>
            <Image
              source={require('../images/gobackbutton.png')}
              style={{width: 100, height: 30, alignItems: 'center', borderRadius: 20}}
              />
          </TouchableOpacity>
            <TouchableOpacity 
          onPress={handleSave}>
            <Image
              source={require('../images/saveprofilebutton.png')}
              style={{width: 100, height: 30, alignItems: 'center', borderRadius: 20}}
              />
          </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
        </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginTop: 5,
    },
    container: {
        flex: 1,
        padding: 20,
        marginTop: 20,
        borderWidth: 1,  
        borderColor: 'black', 
        borderRadius: 30,
        backgroundColor: '#5b4636',
    },
  uploadButton: {
    borderRadius: 5,
    width: 150,
    height: 50,
    backgroundColor: '#ffb6b9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectList: {
    backgroundColor: 'lightbrown',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
    padding: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  inputStyles: {
    color: 'white', 
  },
  dropdownStyles: {
    backgroundColor: 'lightbrown', 
  },
  dropdownItemStyles: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  customText: {
    fontFamily: 'Roxborough CF Bold', 
    fontSize: 40, 
    alignSelf: 'center'
  },
  imagebutton: {
    width: 160, 
    height: 50, 
    alignSelf: 'center', 
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
  },
});