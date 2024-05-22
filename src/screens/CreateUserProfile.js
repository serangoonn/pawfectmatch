import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from'@react-navigation/core';
import { firestore } from "../utils/firebase"
import { collection, addDoc, doc, getDocs } from 'firebase/firestore';
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
        {key:'1', value:'Mobiles'},
        {key:'2', value:'Appliances'},
        {key:'3', value:'Cameras'},
        {key:'4', value:'Computers'},
        {key:'5', value:'Vegetables'},
        {key:'6', value:'Diary Products'},
        {key:'7', value:'Drinks'},
    ];

    // save user information
    const handleSave = async () => {
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
        <View style={styles.container}>
            <Text>Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
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

            <Text>Breed Preference</Text>
            <TextInput
                style={styles.input}
                value={breedPreference}
                onChangeText={setBreedPreference}
            />

            <Text>Experience Level</Text>
            <TextInput
                style={styles.input}
                value={experienceLevel}
                onChangeText={setExperienceLevel}
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
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});
