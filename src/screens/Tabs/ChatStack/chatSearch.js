import { Image, ScrollView, ImageBackground, StyleSheet, Text, View, Button } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import MyTextInput from '@/src/components/MyTextInput';
import { useNavigation } from'@react-navigation/core';
import Icon from 'react-native-vector-icons/Ionicons';

const Chat = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  
  const handleClearSearch = () => {
    setSearchText('');
  };

/*  return (
    <ImageBackground 
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >

        <Image 
          source={require('../HomeStack/images/header.png')}
        />

        <ScrollView>

        <TouchableOpacity onPress={() => navigation.push('Swipe')}> 
        </TouchableOpacity>

        <View style={{flex: 1, height: 1, backgroundColor: 'brown', marginTop:20}} />

        <View style={styles.searchContainer}>
          <MyTextInput 
            style={styles.input}
            placeholder={"Search for contact"}
            value={searchText}
            onChangeText={setSearchText}
            //onChangeText={(text) => handleInputChange(text)}
          />
          <TouchableOpacity onPress={() => alert('Search icon clicked')}>
            <Icon 
              name="search" // Ionicons search icon
              size={24} 
              color="black" 
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon 
                name="close-circle" // Ionicons cancel icon
                size={24} 
                color="black" 
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Chat

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: 350,
  },
  input: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: -35,
  },
  clearIcon: {
    marginLeft: 10,
  },
});*/

return (
  <ImageBackground 
    source={require('../HomeStack/images/lightbrown.png')}
    style={styles.background}
  >
    <Image 
      source={require('../HomeStack/images/header.png')}
    />

    <ScrollView>
      <TouchableOpacity onPress={() => navigation.push('Swipe')}>
        {/* Add any content here if needed */}
      </TouchableOpacity>

      <View style={{ flex: 1, height: 1, backgroundColor: 'brown', marginTop: 20 }} />

      <View style={styles.searchContainer}>
        <MyTextInput 
          style={styles.input}
          placeholder={"Search for contact"}
          value={searchText}
          onChange={setSearchText}
        />
        <TouchableOpacity onPress={() => alert('Search icon clicked')}>
          <Icon 
            name="search" // Ionicons search icon
            size={24} 
            color="black" 
            style={styles.searchIcon}
          />
        </TouchableOpacity>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Icon 
              name="close-circle" // Ionicons cancel icon
              size={24} 
              color="black" 
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <Image 
      source={require('../ChatStack/images/chats.png')}
      />

      <Image 
      source={require('../ChatStack/images/profile icon.png')}
      style={styles.profileicon}
      />

      <Image 
      source={require('../ChatStack/images/recent.png')}
      style={styles.recent}
      />
    </ScrollView>
  </ImageBackground>
);
};

export default Chat;

const styles = StyleSheet.create({
background: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'transparent',
  borderRadius: 5,
  padding: 10,
  margin: 10,
  width: 350,
  marginTop: -20,
},
input: {
  flex: 1,
  height: 40,
},
searchIcon: {
  marginLeft: -35,
},
clearIcon: {
  marginLeft: 0,
},
profileicon: {
  marginTop: 20, 
},
recent: {
  flexDirection: 'row',
  width: 200,
  height: 30,
},
});