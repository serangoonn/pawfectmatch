import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import MyTextInput from "../components/MyTextInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from'@react-navigation/core';
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
      source={require('../images/registerbackground.png')}
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
          onPress={handleSignup}>
            <Image
              source={require('../images/registerbutton.png')}
              style={{width: 200, height: 60}}
              />
          </TouchableOpacity>

          <TouchableOpacity
          style={styles.forgotPassword} 
          onPress={() => navigation.goBack()}>

          <Text style={styles.signupText}> 
            Go Back 
          </Text>
          </TouchableOpacity>
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
      padding: 30,
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
