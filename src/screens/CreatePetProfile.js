import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MyBtn from "../components/MyBtn";
import { useNavigation } from'@react-navigation/core';

export default function CreatePetProfile () {
  const navigation = useNavigation();

  return (
    <View>
        <Text>CreatePetProfile</Text>
    
        <MyBtn 
        text={"Submit"}
        onPress={()=> {
        navigation.reset({
            index: 0,
            routes: [{ name: "Home"}],
        });
    }}
        />
        </View>
        );
}



/*import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';*/

/*export default function CreateProfilePet() {
    // create user profile form
    const [ username, setUsername] = useState("");
    const [ characteristics, setCharacteristics] = useState({
        option1: false,
        option2: false,
        option3: false,
    });

    const handleSubmit = async()=>{
        try {
            const userProfile = {
                username,
                characteristics: Object.keys(characteristics).filter(option => characteristics[option]),
            };
            await addDoc(collection(firestore, 'users'), userProfile);
            alert('Profile saved successfully!');
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const handleCharacteristicsChange = (option) => {
        setCharacteristics({
          ...characteristics,
          [option]: !characteristics[option],
        });
      };

      return (
        <View style={styles.container}>
          <Text>Username:</Text>
          <TextInput
            style={styles.input}
            value={username}
            placeholder={"Username"}
            onChangeText={(e) => {
              setUsername(e);
            }}

          />
          <Text>Characteristics:</Text>
          {Object.keys(characteristics).map(option => (
            <View key={option} style={styles.checkboxContainer}>
            <CheckBox
            disabled={false}
            value={characteristics[option]}
            onValueChange={(newValue) => setCharacteristics(newValue)}
            />

              <Text>{option.replace('option', 'Option ')}</Text>
            </View>
          ))}
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
          padding: 20,
        },
        input: {
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 20,
          padding: 10,
        },
        checkboxContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        },
      });*/