import { TextInput, Image, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import MyTextInput from "../components/MyTextInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from'@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigation = useNavigation();
  
    //change the password
   const handleForgotPassword = () => {
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent")
    }).catch((error) => {
      alert(error)
    })
  }

  return (
    <ImageBackground
      source={require('../images/ForgotPasswordBackground.png')}
      style={styles.background}
    > 
      <SafeAreaView style={styles.container}>

        <Text style = {{ fontSize: 25, textAlign: 'center', color: 'white', marginBottom: 40, marginTop: 90}}>
            Enter your email and we'll send you a link to change your password!
        </Text>

        <TextInput 
          style={styles.input}
          value={email}
          placeholder={"Email"}
          onChange={(e) => setEmail(e)}
        />
      
          <TouchableOpacity 
            onPress={handleForgotPassword}>
            <Image
              source={require('../images/ForgotPasswordButton.png')}
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
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: 20,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: '#f2dcae',
      paddingHorizontal: 10,
      marginBottom: 30,
      width: '80%',
      borderRadius: 30,
    },
    buttonContainer: {
      marginBottom: 20,
      width: '100%',
    },
    forgotPassword: {
      padding: 30,
    },
    signupText: {
      color: 'white',
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
