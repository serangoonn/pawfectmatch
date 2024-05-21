//navigation between screens

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from '../src/screens/Login';
import HomeScreen from '../src/screens/Home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PetOrOwner from '../src/screens/PetOrOwner';
import CreatePetProfile from '../src/screens/CreatePetProfile';
import CreateUserProfile from '../src/screens/CreateUserProfile';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Navigator>
                 <Stack.Screen name="Login" component={LoginScreen}/>
                 <Stack.Screen name="PetOrOwner" component={PetOrOwner}/>
                 <Stack.Screen name="Pets" component={CreatePetProfile}/>
                 <Stack.Screen name="Aspiring Pet Owners" component={CreateUserProfile}/>
                 <Stack.Screen name="Home" component={HomeScreen}/>
            </Stack.Navigator>
            </GestureHandlerRootView>
    );
}
