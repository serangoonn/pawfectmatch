import { ScrollView, Image, TouchableOpacity, SafeAreaView, ImageBackground, StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from'@react-navigation/core';
import { firestore } from "../utils/firebase"
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list'

export default function CreateUserProfile () {
    // navigation
    const navigation = useNavigation();

    // user information
    const [username, setUsername] = useState('');
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
    const [breedPreference, setBreedPreference] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [fixedCharacteristics, setFixedCharacteristics] = useState([]);
    const characteristicsOptions = [
        {key:'1', value:'Small'},
        {key:'2', value:'Big'},
        {key:'3', value:'Active'},
        {key:'4', value:'CPlayful'},
        {key:'5', value:'Disciplined'},
        {key:'6', value:'Quiet'},
        {key:'7', value:'Open to rescue animals'},
    ];


    // error if a field is not filled in
    const validateFields = () => {
      if (!username || !animalPreference || !location || !experienceLevel || !breedPreference || !fixedCharacteristics.length ) {
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
            await addDoc(collection(firestore, 'userProfiles'),{
                username,
                location,
                animalPreference,
                breedPreference,
                experienceLevel,
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

    return (
      <ImageBackground
      source={require('../images/createprofilesbackground.png')}
      style={styles.background}
    >

      <View style={styles.container}>
      <ScrollView>

        <Text style={styles.customText}>
          Aspiring Pet Owners
        </Text>

            <Text style={{color: 'white'}}>Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
            />

            <Text style={{color: 'white'}}>Location</Text>
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

            <Text style={{color: 'white', marginTop: 15}}>Type of Animal Preference</Text>
            <SelectList 
            setSelected = {setAnimalPreference} 
            data={animalOptions} 
            save="value"
            placeholder="Select an Animal Preference"
            boxStyles={styles.selectList} 
            inputStyles={styles.inputStyles} 
            dropdownStyles={styles.dropdownStyles} 
            dropdownItemStyles={styles.dropdownItemStyles}
           />

<Text style={{color: 'white', marginTop:10}}> Fixed Characteristics</Text>
            <MultipleSelectList 
            setSelected={(val) => setFixedCharacteristics(val)} 
            data={characteristicsOptions} 
            save="value"
            label="Categories"
            boxStyles={styles.selectList} 
            inputStyles={styles.inputStyles} 
            dropdownStyles={styles.dropdownStyles} 
            dropdownItemStyles={styles.dropdownItemStyles} 
            placeholderTextColor="white" 
            />

            <Text style={{color: 'white', marginTop: 10}}>Breed Preference</Text>
            <TextInput
                style={styles.input}
                value={breedPreference}
                onChangeText={setBreedPreference}
            />

            <Text style={{color: 'white'}}>Experience Level</Text>
            <TextInput
                style={styles.input}
                value={experienceLevel}
                onChangeText={setExperienceLevel}
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
  customText: {
    fontFamily: 'Roxborough CF Bold', 
    fontSize: 40, 
    alignSelf: 'center'
  },
});
