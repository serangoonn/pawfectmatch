//home screen after successful log in

import { Image, ScrollView, ImageBackground, StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import MyTextInput from '@/src/components/MyTextInput';
import { useNavigation } from'@react-navigation/core';

const Home = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground 
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >

        <Image 
        source={require('../HomeStack/images/header.png')}
        />

        <ScrollView>

      <Text style={{marginTop:10}}>
        welcome back!
      </Text>

        <TouchableOpacity onPress={() => navigation.push('Swipe')}> 
            <Image
              source={require('../HomeStack/images/adoptnowbutton.png')}
              style={styles.imageButtonAdoptNow}
            />
        </TouchableOpacity>

        <View style={{flex: 1, height: 1, backgroundColor: 'brown', marginTop:20}} />

        <Text>
        Liked pets
      </Text>

      <Text>
        Categories
      </Text>

      <MyTextInput 
          style={styles.input}
          placeholder={"Search for pet"}
          //onChange={}
        />

      </ScrollView>
    </ImageBackground>
  );
};

export default Home

const styles = StyleSheet.create({
    background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonAdoptNow: {
    width: 330,
    height: 150,
    marginTop: 10,
    marginLeft: 15,
    borderRadius: 10,
  },
  })