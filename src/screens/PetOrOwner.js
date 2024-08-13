import { Image, ImageBackground, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/core";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function PetOrOwner() {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../images/PetOrOwnerbackground.png")}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <SafeAreaView style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.push("CreatePetProfile");
            }}
          >
            <Image
              source={require("../images/petbutton.png")}
              style={styles.imageButtonPet}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.push("CreateUserProfile");
            }}
          >
            <Image
              source={require("../images/aspiringpetownersbutton.png")}
              style={styles.imageButtonAspiringPetOwners}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  imageButtonPet: {
    width: 180,
    height: 55,
    marginTop: 200,
    marginLeft: 15,
  },
  imageButtonAspiringPetOwners: {
    width: 200,
    height: 57,
    marginLeft: 10,
    marginTop: 200,
  },
  textButton: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
});
