import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MyBtn from "../components/MyBtn";
import { useNavigation } from'@react-navigation/core';

export default function CreateUserProfile () {
  const navigation = useNavigation();

  return (
    <View>
        <Text>CreateUserProfile</Text>
    
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