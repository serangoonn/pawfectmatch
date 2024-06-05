import { ScrollView, ImageBackground, StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, Button } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from'@react-navigation/core';
import { firestore } from "../utils/firebase"
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list'
import { uploadBytes, ref } from 'firebase/storage';
import { storage } from '../utils/firebase';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePetProfile () {
    // navigation
    const navigation = useNavigation();

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
    const [animal, setAnimalPreference] = useState("");
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

    // save user information
    const handleSave = async () => {
        try {
            const isUsernameAvailable = await checkUsernameAvailability();
            if (isUsernameAvailable) {
              await addDoc(collection(firestore, 'petProfiles'),{
                username,
                location,
                animal,
                breed,
                description,
                fixedCharacteristics,
            });
            alert('Profile saved successfully!');
            navigation.reset({
                index: 0,
                routes: [{ name: "PawfectMatch"}],
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

    const [image, setImage] = useState('');

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

  
    const submitData = async () => {
      if (image) {
        const fileName = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${fileName}`);
  
        const response = await fetch(image);
        const blob = await response.blob();
  
        uploadBytes(storageRef, blob).then(() => {
          console.log('Image uploaded to Firebase storage');
        }).catch((error) => {
          console.error('Error uploading image: ', error);
        });
      } else {
        console.log('No image selected');
      }
    };

    return (
      <ImageBackground
      source={require('../images/createpetprofilebackground.png')}
      style={styles.background}
    >

      <ScrollView>

      <Button title="Pick an image from camera roll" onPress={handleImagePick} />
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button 
      onPress={submitData} 
      title = "upload"
      />
            
      <View style={styles.container}>
            <Text style={{color: 'white'}}> Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
            />

            <Text style={{color: 'white'}}> Pet Name</Text>
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
           boxStyles={styles.selectList} // Custom styles for the select list box
           inputStyles={styles.inputStyles} // Custom styles for the input text
           dropdownStyles={styles.dropdownStyles} // Custom styles for the dropdown list
           dropdownItemStyles={styles.dropdownItemStyles} // Custom styles for dropdown items
           />

            <Text style={{color: 'white', marginTop:15}}> Type of Animal Preference</Text>
            <SelectList 
            setSelected = {setAnimalPreference} 
            data={animalOptions} 
            save="value"
            placeholder="Select an Animal Preference"
            boxStyles={styles.selectList} // Custom styles for the select list box
            inputStyles={styles.inputStyles} // Custom styles for the input text
            dropdownStyles={styles.dropdownStyles} // Custom styles for the dropdown list
            dropdownItemStyles={styles.dropdownItemStyles} // Custom styles for dropdown items
           />

            <Text style={{color: 'white', marginTop: 10}}> Breed</Text>
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
                placeholderTextColor="white" // Change this to your desired color
            />

            <Text style={{color: 'white'}}> Fixed Characteristics</Text>
            <MultipleSelectList 
            setSelected={(val) => setFixedCharacteristics(val)} 
            data={characteristicsOptions} 
            save="value"
            //onSelect={() => alert(fixedCharacteristics)} 
            label="Categories"
            boxStyles={styles.selectList} // Custom styles for the select list box
            inputStyles={styles.inputStyles} // Custom styles for the input text
            dropdownStyles={styles.dropdownStyles} // Custom styles for the dropdown list
            dropdownItemStyles={styles.dropdownItemStyles} // Custom styles for dropdown items
            placeholderTextColor="white" // Change this to your desired color
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
        </View>
        </ScrollView>
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
    },
  selectButton: {
    borderRadius: 5,
    width: 150,
    height: 50,
    backgroundColor: '#8ac6d1',
    alignItems: 'center',
    justifyContent: 'center'
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 50,
    alignItems: 'center'
  },
  progressBarContainer: {
    marginTop: 20
  },
  imageBox: {
    width: 300,
    height: 300
  },
  goback: {
    alignItems: 'center'
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectList: {
    backgroundColor: 'lightbrown', // Custom background color for select list box
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
    padding: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  inputStyles: {
    color: 'white', // Placeholder and input text color
  },
  dropdownStyles: {
    backgroundColor: 'lightbrown', // Custom background color for dropdown list
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
  },
});