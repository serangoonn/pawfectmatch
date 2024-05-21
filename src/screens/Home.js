//home screen after successful log in

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { auth } from "../utils/firebase"
import { useNavigation } from'@react-navigation/core';

export default function Home() {
  const navigation = useNavigation();

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }

  return (
    <View style={StyleSheet.container}>
      <Text>Email: {auth.currentUser?.email} </Text>
      <TouchableOpacity
      onPress = {handleSignOut}
      style={styles.button}
      >
        <Text styles={styles.buttonText}> sign out </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItens: "center"
  },
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 20,
    width: "60%",
  },
  buttonText: {
    color: "white",
    textAlign: "center"
  },
  })