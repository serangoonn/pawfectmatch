//login screen 

import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import MyTextInput from "../components/MyTextInput";
import MyBtn from "../components/MyBtn";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from'@react-navigation/core';
import { firebase } from "../utils/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  //sign up new users
  const handleSignup = async()=>{
 await createUserWithEmailAndPassword(auth, email, password)
.then((userCredential) => {
  //signed in
  const user = userCredential.user;
  console.log("user data,", user)
  // ..
})
.catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  // ..
});
}

  //sign in existing users
  const handleLogin = async()=>{
    await signInWithEmailAndPassword(auth, email, password)
   .then((userCredential) => {
     //signed in
     const user = userCredential.user;
     console.log("user data,", user)
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
        navigation.replace("PetOrOwner")
      }
    })
    return unsubscribe}, [])
    

  // type in email and password & sign up button
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text> Login Screen</Text>

      <MyTextInput
      value={email}
      placeholder={"Email"}
      onChange={(e) => {
        setEmail(e);
      }}
      />

      <MyTextInput
      value={password}
      placeholder={"Password"}
      onChange={(e) => {
      setPassword(e);
    }}
    />
    <View style={{ marginBotton: 20}} />
  
    <MyBtn 
    text={"sign up"}
    onPress={()=> {
      handleSignup();
    }}
    />

    <View style={{ marginBotton: 20, padding: 3}} />

    <MyBtn 
    text={"login"}
    onPress={()=> {
      handleLogin();
    }}
    />

    <TouchableOpacity 
      style={{
            padding: 10,
        }}
            onPress={() => {
            handleForgotPassword();
        }}
        >
            <Text
                style={{
                    color: "black",
                    textAlign: "center"
                }}
                > Forgot Password </Text>
        </TouchableOpacity>
    </View>
  );
}
