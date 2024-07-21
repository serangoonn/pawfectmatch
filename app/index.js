//navigation between screens
import { Image, Text } from "react-native";
//import React, { useState, useEffect } from 'react';
//import { useNavigation } from '@react-navigation/core';

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../src/screens/Login";
import HomeScreen from "../src/screens/Tabs/HomeStack/Home";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PetOrOwner from "../src/screens/PetOrOwner";
import CreatePetProfile from "../src/screens/CreatePetProfile";
import CreateUserProfile from "../src/screens/CreateUserProfile";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "../src/screens/Tabs/ProfileStack/Profile";
import ContactListScreen from "../src/screens/Tabs/ChatStack/ContactList";
import RegisterScreen from "../src/screens/Register";
import SwipingScreen from "../src/screens/Tabs/HomeStack/Swipe";
import FeedScreen from "../src/screens/Tabs/SocialStack/Feed";
import PostScreen from "../src/screens/Tabs/SocialStack/Post";
import ForgotPasswordScreen from "../src/screens/ForgotPassword";
import ChatScreen from "../src/screens/Tabs/ChatStack/Chat";
import FeedbackRating from "../src/screens/Tabs/ProfileStack/FeedbackRating";
import EditUserProfile from "../src/screens/Tabs/ProfileStack/EditUserProfile";
import EditPetProfile from "../src/screens/Tabs/ProfileStack/EditPetProfile";
import FeedbackScreen from "../src/screens/Tabs/HomeStack/Feedback";

//icons
import homeicon from "../app/icons/homeicon.png";
import chaticon from "../app/icons/chaticon.png";
import socialicon from "../app/icons/socialicon.png";
import profileicon from "../app/icons/profileicon.png";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ContactList"
      component={ContactListScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const SocialStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Feed"
      component={FeedScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Post"
      component={PostScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Swipe"
      component={SwipingScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Feedback"
      component={FeedbackScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="ContactList"
      component={ContactListScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="EditUserProfile"
      component={EditUserProfile}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="EditPetProfile"
      component={EditPetProfile}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="FeedbackRating"
      component={FeedbackRating}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

const HomeTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: "#B39D7A",
        //display: tabBarVisible ? 'flex': 'none'
      },
    }}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{
        headerShown: false,
        tabBarLabel: () => (
          <Text style={{ color: "#7D5F26", marginTop: 35, fontWeight: "bold" }}>
            Home
          </Text>
        ),
        tabBarIcon: () => (
          <Image
            source={homeicon}
            style={{
              tintColor: "#EDD7B5",
              width: 25,
              height: 25,
              marginTop: 40,
            }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="ChatStack"
      component={ChatStack}
      options={{
        headerShown: false,
        tabBarLabel: () => (
          <Text style={{ color: "#7D5F26", marginTop: 35, fontWeight: "bold" }}>
            Chat
          </Text>
        ),
        tabBarIcon: () => (
          <Image
            source={chaticon}
            style={{
              tintColor: "#EDD7B5",
              width: 25,
              height: 25,
              marginTop: 40,
            }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="SocialStack"
      component={SocialStack}
      options={{
        headerShown: false,
        tabBarLabel: () => (
          <Text style={{ color: "#7D5F26", marginTop: 35, fontWeight: "bold" }}>
            Social
          </Text>
        ),
        tabBarIcon: () => (
          <Image
            source={socialicon}
            style={{
              tintColor: "#EDD7B5",
              width: 25,
              height: 25,
              marginTop: 40,
            }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="ProfileStack"
      component={ProfileStack}
      options={{
        headerShown: false,
        tabBarLabel: () => (
          <Text style={{ color: "#7D5F26", marginTop: 35, fontWeight: "bold" }}>
            Profile
          </Text>
        ),
        tabBarIcon: () => (
          <Image
            source={profileicon}
            style={{
              tintColor: "#EDD7B5",
              width: 25,
              height: 25,
              marginTop: 40,
            }}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PetOrOwner"
          component={PetOrOwner}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Pets"
          component={CreatePetProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Aspiring Pet Owners"
          component={CreateUserProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PawfectMatch"
          component={HomeTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  );
}
