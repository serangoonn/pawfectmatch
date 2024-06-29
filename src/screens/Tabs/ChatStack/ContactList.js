// search contact function not done up

import React, { useEffect, useState } from 'react';
import { RefreshControl, ImageBackground, View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MyTextInput from '@/src/components/MyTextInput';

export default function ContactList() {
  const [likedProfiles, setLikedProfiles] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Get the current user ID
  const auth = getAuth();
  const currentUser = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    fetchLikedProfiles();
  }, []);

  const fetchLikedProfiles = async () => {
    try {
      const docRef = doc(firestore, 'likedProfiles', currentUser);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLikedProfiles(docSnap.data().profiles);
      } else {
        console.log("No liked profiles found!");
      }
    } catch (error) {
      console.error("Error fetching liked profiles: ", error);
    }
  };   

  const handleProfilePress = (profile) => {
    navigation.navigate('Chat', { profile });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLikedProfiles();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >
        <Image 
        source={require('../HomeStack/images/header.png')}
        />

        <MyTextInput 
          style={styles.input}
          placeholder={"Search for contact"}
          //onChange={}
        />

      <FlatList
        style={styles.accounts}
        data={likedProfiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProfilePress(item.username)}>
            <View style={styles.profile}>
              <Image source={{ uri: item.imageUrl }} style={styles.profileImage} />
              <Text style={styles.username}>{item.username}</Text>
            </View>
          </TouchableOpacity>
          
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 90,
    marginRight: 10,
    marginLeft: 30,
  },
  username: {
    fontSize: 18,
  },
  background: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },
  accounts: {
    alignSelf: 'left'
  },
});
