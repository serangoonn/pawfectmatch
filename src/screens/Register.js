import { Image, ImageBackground, StyleSheet, Text, View, TextInput, TouchableOpacity, Button } from 'react-native';
import { useState, useEffect } from 'react';
import MyTextInput from "../components/MyTextInput";
import MyBtn from "../components/MyBtn";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from'@react-navigation/core';
import { firebase } from "../utils/firebase";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();
  
    //sign up new users
    const handleSignup = async()=>{
   await createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    //signed in
    const user = userCredential.user;
    console.log("user data,", user);
    navigation.replace("PetOrOwner");
    // ..
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
  }

  return (
    <ImageBackground
      source={require('../images/loginbackground.png')}
      style={styles.background}
    > 
      <SafeAreaView style={styles.container}>
        <MyTextInput 
          style={styles.input}
          value={email}
          placeholder={"Email"}
          onChange={(e) => setEmail(e)}
        />
        <MyTextInput
          style={styles.input}
          value={password}
          placeholder={"Password"}
          onChange={(e) => setPassword(e)}
        />

        <TouchableOpacity
          style={styles.forgotPassword} 
          onPress={handleSignup}
        >
          <Text style={styles.signupText}> 
            Sign up! 
          </Text>
          </TouchableOpacity>
          <Button title="Go to Home" onPress={() => navigation.goBack()} />
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      padding: 20,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: 'gray',
      paddingHorizontal: 10,
      marginBottom: 10,
      width: '100%',
    },
    buttonContainer: {
      marginBottom: 20,
      width: '100%',
    },
    forgotPassword: {
      padding: 10,
    },
    signupText: {
      color: 'black',
      textAlign: 'center',
    },
    forgotPasswordText: {
      color: 'black',
      textAlign: 'center',
      paddingBottom: 10,
      textDecorationLine: 'underline',
      paddingLeft: 150,
    }
  });
