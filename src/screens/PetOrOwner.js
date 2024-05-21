// options to choose if user is an aspiring pet owner or setting a pet account up

import { StyleSheet, Text, View, Button } from 'react-native';
import React from 'react';
import { useNavigation } from'@react-navigation/core';


export default function PetOrOwner() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.question}>Is your profile for a pet or are you an aspiring pet owner?</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Pets"
          onPress={() => navigation.navigate('Pets')}
        />
        <Button
          title="Aspiring Pet Owners"
          onPress={() => navigation.navigate('Aspiring Pet Owners')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});
  




