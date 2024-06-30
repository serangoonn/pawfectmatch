import React, { useEffect, useState } from 'react';
import { RefreshControl, FlatList, Image, ScrollView, ImageBackground, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {  doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/core';
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';


const Home = () => {
  const navigation = useNavigation();
  const [starredPets, setStarredPets] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get the current user ID
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || '');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStarredPets();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStarredPets();
    setRefreshing(false);
  };

  const fetchStarredPets = async () => {
    try {
      const docRef = doc(firestore, 'StarPets', username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStarredPets(docSnap.data().profiles);
      } else {
        console.log("No liked profiles found!");
      }
    } catch (error) {
      console.error("Error fetching liked profiles: ", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../HomeStack/images/lightbrown.png')}
      style={styles.background}
    >
      <Image 
        source={require('../HomeStack/images/header.png')}
      />

        <Text style={{ marginTop: 10, alignSelf: 'left', marginLeft: 10 }}>
          Welcome back!
        </Text>

        <TouchableOpacity onPress={() => navigation.push('Swipe')}>
          <Image
            source={require('../HomeStack/images/adoptnowbutton.png')}
            style={styles.imageButtonAdoptNow}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, height: 1, backgroundColor: 'brown', marginTop: 20 }} />

        <Text style={{alignSelf: 'left', marginLeft: 10}}>
          Liked pets
        </Text>

        <Text style={{alignSelf: 'left', marginLeft: 10, marginBottom: 10}}>
          Categories
        </Text>

        <FlatList
        style={styles.accounts}
        data={starredPets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <View style={styles.profile}>
              <Image source={{ uri: item.imageUrl }} style={styles.profileImage} />
              <View style ={styles.information}>
              <Text style={styles.username}>username: {item.username}</Text>
              <Text style={styles.username}>location: {item.location}</Text>
              <Text style={styles.username}>animal type: {item.animal}</Text>
              <Text style={styles.username}>breed: {item.breed}</Text>
              <Text style={styles.username}>description: {item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

        {/* Replace with your category components */}

    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
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
  petContainer: {
    backgroundColor: '#EDD7B5',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  petImage: {
    width: 160,
    height: 150,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 10,
  },
  accounts: {
    alignSelf: 'left'
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  information: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 90,
    marginRight: 10,
    marginLeft: 30,
  },
  username: {
    fontSize: 10,
    alignSelf: 'left',
  },
});
