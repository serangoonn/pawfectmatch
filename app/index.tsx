//navigation between screens

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from '../src/screens/Login';
import HomeScreen from '../src/screens/Home.js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PetOrOwner from '../src/screens/PetOrOwner';
import CreatePetProfile from '../src/screens/CreatePetProfile';
import CreateUserProfile from '../src/screens/CreateUserProfile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../src/screens/Profile';
import ChatScreen from '../src/screens/Chat';
import RegisterScreen from '../src/screens/Register';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name = "Home" component={HomeScreen} />
        <Tab.Screen name = "Profile" component={ProfileScreen} />
        <Tab.Screen name = "Chat" component={ChatScreen} />
    </Tab.Navigator>
);

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Navigator>
                 <Stack.Screen name="Login" component={LoginScreen}
                 options ={{ 
                    headerShown: false,
                    }}
                    />
                 <Stack.Screen name="Register" component={RegisterScreen}
                 options ={{ 
                    headerShown: false,
                    }}
                    />
                 <Stack.Screen name="PetOrOwner" component={PetOrOwner}
                 options ={{ 
                    headerShown: false,
                    }}
                    />
                 <Stack.Screen name="Pets" component={CreatePetProfile}
                 options ={{ 
                    headerShown: false,
                    }}
                    />
                 <Stack.Screen name="Aspiring Pet Owners" component={CreateUserProfile}
                 options ={{ 
                    headerShown: false,
                    }}
                    />
                 <Stack.Screen name="PawfectMatch" component={HomeTabNavigator}/>
            </Stack.Navigator>
            </GestureHandlerRootView>
    );
}
