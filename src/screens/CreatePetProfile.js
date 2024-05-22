import { StyleSheet, Text, View, TextInput, Button, Image, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from'@react-navigation/core';
import { firestore, storage, uploadImage } from "../utils/firebase"
import { collection, addDoc, doc, getDocs } from 'firebase/firestore';
//import ImagePicker from 'react-native-image-picker';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list'
//import DocumentPicker from 'react-native-document-picker';

export default function CreatePetProfile () {
    // navigation
    const navigation = useNavigation();

    // upload image
//   const [uploading, setUploading] = useState(false);
//   const [transferred, setTransferred] = useState(0);

    // user information
    const [image, setImage] = useState(null);
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
    const [animalPreference, setAnimalPreference] = useState("");
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
        {key:'1', value:'Mobiles'},
        {key:'2', value:'Appliances'},
        {key:'3', value:'Cameras'},
        {key:'4', value:'Computers'},
        {key:'5', value:'Vegetables'},
        {key:'6', value:'Diary Products'},
        {key:'7', value:'Drinks'},
    ];

    // save user information
    const handleSave = async (imageUri) => {
        try {
            const isUsernameAvailable = await checkUsernameAvailability();
            if (isUsernameAvailable) {
           // const imageUrl = await uploadImage(imageUri, `profile_images/${username}`);
            await addDoc(collection(firestore, 'petProfiles'),{
                //imageUrl,
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

    // select image from camera roll
    /*const pickImage = async () => {
        try {
          const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.images],
          });
          setImageURI(res.uri);
        } catch (err) {
          if (DocumentPicker.isCancel(err)) {
            // User cancelled the picker
            console.log('User cancelled image picker');
          } else {
            // Error occurred while picking the image
            console.error('Error picking image:', err);
          }
        }
      };*/

    // upload image (new)
    /*const uploadImageToFirebase = async () => {
        if (!imageURI) {
          Alert.alert('No image selected', 'Please select an image first');
          return;
        }
      
        try {
          const response = await fetch(imageURI);
          const blob = await response.blob();
      
          const fileName = imageURI.substring(imageURI.lastIndexOf('/') + 1);
          const storageRef = storage().ref(`images/${fileName}`);
      
          const uploadTask = storageRef.put(blob);
      
          // Monitoring upload progress
          uploadTask.on('state_changed', 
            snapshot => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              console.log('Upload is ' + progress + '% done');
            }, 
            error => {
              console.error('Error uploading image:', error);
              Alert.alert('Upload failed', 'Failed to upload image to Firebase Storage');
            }, 
            () => {
              // Upload completed successfully, handle success here
              console.log('Upload successful');
              Alert.alert('Upload successful', 'Image has been uploaded to Firebase Storage');
            }
          );
        } catch (error) {
          console.error('Error uploading image to Firebase:', error);
          Alert.alert('Upload failed', 'Failed to upload image to Firebase Storage');
        }
      };*/

        // failed upload image
       /* <Button title="Select Image" onPress={pickImage} />
        {imageURI && <Image source={{ uri: imageURI }} style={{ width: 200, height: 200 }} />}
        <Button title="Upload Image" onPress={uploadImageToFirebase} />*/

    return (
        <View style={styles.container}>
            <Text>Upload your pet's picture!</Text>

            <Text>Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
            />

            <Text>Pet Name</Text>
            <TextInput
                style={styles.input}
                value={petname}
                onChangeText={setPetName}
            />

            <Text>Location</Text>
            <SelectList 
            setSelected = {setLocation} 
            data={locationOptions} 
            save="value"
            placeholder="Select a location"
            />

            <Text>Type of Animal Preference</Text>
            <SelectList 
            setSelected = {setAnimalPreference} 
            data={animalOptions} 
            save="value"
            placeholder="Select an Animal Preference"
            />

            <Text>Breed</Text>
            <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
            />

            <Text>Description of pet</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <Text>Fixed Characteristics</Text>
            <MultipleSelectList 
            setSelected={(val) => setFixedCharacteristics(val)} 
            data={characteristicsOptions} 
            save="value"
            //onSelect={() => alert(fixedCharacteristics)} 
            label="Categories"
            />
            <Button title="Save Profile" onPress={handleSave} />
        </View>
    );
};


const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    container: {
        flex: 1,
        padding: 20,
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
  }
});