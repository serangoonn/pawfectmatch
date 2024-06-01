//login screen 

import { Image, ImageBackground, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import MyTextInput from "../components/MyTextInput";
import MyBtn from "../components/MyBtn";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from'@react-navigation/core';
import { firebase } from "../utils/firebase";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  //sign up new users
  const handleSignup = async()=>{
  navigation.push("Register");
}

  //sign in existing users
  const handleLogin = async()=>{
    await signInWithEmailAndPassword(auth, email, password)
   .then((userCredential) => {
     //signed in
     const user = userCredential.user;
     console.log("user data,", user);
     navigation.navigate("PawfectMatch");
     // ..
   })
   .catch((error) => {
     const errorCode = error.code;
     const errorMessage = error.message;
     // ..
   });
   }

   //change the password
   const handleForgotPassword = () => {
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent")
    }).catch((error) => {
      alert(error)
    })
  }


   //navigation
   useEffect(()=>{
    const unsubscribe = auth.onAuthStateChanged(user=> {
      if (user) {
        navigation.navigate("PawfectMatch")
      }
    })
    return unsubscribe}, [])
    

  // type in email and password & sign up button
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
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}> 
            Forgot Password? 
          </Text>
        </TouchableOpacity>

          <TouchableOpacity 
          onPress={handleLogin}>
            <Image
              source={require('../images/loginbutton.png')}
              style={{width: 200, height: 60}}
              />
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.forgotPassword} 
          onPress={handleSignup}
        >
          <Text style={styles.signupText}> 
            Dont have an account? Register here! 
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
