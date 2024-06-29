import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore } from '../../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ContactList() {
  const [likedProfiles, setLikedProfiles] = useState([]);
  const navigation = useNavigation();
  
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

  return (
    <View style={styles.container}>
      <FlatList
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
  },
});
