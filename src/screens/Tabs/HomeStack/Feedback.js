import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { firestore } from "../../../utils/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import RNPickerSelect from "react-native-picker-select";

const Feedback = () => {
  const navigation = useNavigation();
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      const q = query(
        collection(firestore, "feedback"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const feedbackData = [];
        querySnapshot.forEach((doc) => {
          feedbackData.push({ id: doc.id, ...doc.data() });
        });
        setFeedbackList(feedbackData);
      });
      return () => unsubscribe();
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = feedbackList
    .filter((item) =>
      selectedOrganization.length > 0
        ? selectedOrganization.includes(item.organization)
        : true
    )
    .filter((item) => (ratingFilter ? item.rating === ratingFilter : true));

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.organization}>Organization: {item.organization}</Text>
      <Text style={styles.rating}>Rating: {item.rating}</Text>
      <Text style={styles.review}>Review: {item.review}</Text>
      <Text style={styles.username}>User: {item.username}</Text>
      <Text style={styles.date}>
        Date: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
      </Text>
    </View>
  );

  const handleOrganizationSelection = (organization) => {
    setSelectedOrganization([organization]);
  };

  const isSelected = (organization) => {
    return selectedOrganization.includes(organization);
  };

  const handleRatingSelection = (rating) => {
    setRatingFilter(rating);
  };

  return (
    <ImageBackground
      source={require("../HomeStack/images/lightbrown.png")}
      style={styles.background}
    >
      <Image
        source={require("../HomeStack/images/header.png")}
        style={{ alignSelf: "center" }}
      />

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={require("../HomeStack/images/backbutton.png")}
          style={styles.backbutton}
        />
      </TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => setSelectedOrganization([])}
            style={styles.organizationfilter}
          >
            <Text
              style={[
                styles.buttonText,
                selectedOrganization.length === 0 && styles.selectedText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOrganizationSelection("Mercylight")}
            style={styles.organizationfilter}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected("Mercylight") && styles.selectedText,
              ]}
            >
              Mercylight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOrganizationSelection("SPCA")}
            style={styles.organizationfilter}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected("SPCA") && styles.selectedText,
              ]}
            >
              SPCA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOrganizationSelection("The Animal Lodge")}
            style={styles.organizationfilter}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected("The Animal Lodge") && styles.selectedText,
              ]}
            >
              The Animal Lodge
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOrganizationSelection("SOSD")}
            style={styles.organizationfilter}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected("SOSD") && styles.selectedText,
              ]}
            >
              SOSD
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ratingContainer}>
          <RNPickerSelect
            onValueChange={(value) => handleRatingSelection(value)}
            items={[
              { label: "All Ratings", value: "" },
              { label: "1 Star", value: 1 },
              { label: "2 Stars", value: 2 },
              { label: "3 Stars", value: 3 },
              { label: "4 Stars", value: 4 },
              { label: "5 Stars", value: 5 },
            ]}
            value={ratingFilter}
            placeholder={{ label: "Select Rating", value: null }}
            style={pickerSelectStyles}
          />
        </View>

        <FlatList
          data={filteredFeedback}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backbutton: {
    marginLeft: 5,
    marginTop: 10,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  organization: {
    fontWeight: "bold",
  },
  rating: {
    color: "green",
  },
  review: {
    marginTop: 5,
  },
  username: {
    fontStyle: "italic",
    marginTop: 5,
  },
  date: {
    marginTop: 5,
    color: "gray",
  },
  organizationfilter: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#7D5F26",
  },
  buttonText: {
    color: "#7D5F26",
    fontSize: 12,
    textAlign: "center",
  },
  selectedText: {
    fontWeight: "bold",
    color: "#000",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#7D5F26",
    borderRadius: 20,
    color: "#7D5F26",
    paddingRight: 30,
    height: 40,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#7D5F26",
    borderRadius: 8,
    color: "#7D5F26",
    paddingRight: 30,
    height: 40,
  },
  placeholder: {
    color: "#7D5F26", // Change this to your desired placeholder color
  },
});

export default Feedback;
