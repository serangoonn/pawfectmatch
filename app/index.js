//navigation between screens

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../src/screens/Login';
import HomeScreen from '../src/screens/Tabs/HomeStack/Home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PetOrOwner from '../src/screens/PetOrOwner';
import CreatePetProfile from '../src/screens/CreatePetProfile';
import CreateUserProfile from '../src/screens/CreateUserProfile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../src/screens/Tabs/ProfileStack/Profile';
import ContactListScreen from '../src/screens/Tabs/ChatStack/ContactList';
import RegisterScreen from '../src/screens/Register';
import SwipingScreen from '../src/screens/Tabs/HomeStack/Swipe';
import FeedScreen from '../src/screens/Tabs/Social Stack/Feed';
import PostScreen from '../src/screens/Tabs/Social Stack/Post';
import ForgotPasswordScreen from '../src/screens/ForgotPassword';
import ChatScreen from '../src/screens/Tabs/ChatStack/Chat'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ChatStack = () => (
   <Stack.Navigator>
      <Stack.Screen name = "ContactList" component={ContactListScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
      <Stack.Screen name = "Chat" component={ChatScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
   </Stack.Navigator>
)


const SocialStack = () => (
   <Stack.Navigator>
      <Stack.Screen name = "Feed" component={FeedScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
      <Stack.Screen name = "Post" component={PostScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
   </Stack.Navigator>
)

const HomeStack = () => (
   <Stack.Navigator>
      <Stack.Screen name = "Home" component={HomeScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
      <Stack.Screen name = "Swipe" component={SwipingScreen} 
      options ={{ 
         headerShown: false,
         }}
         />
   </Stack.Navigator>
)

const HomeTabNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name = "HomeStack" component={HomeStack} 
        options ={{ 
         headerShown: false,
         }}
         />
        <Tab.Screen name = "ChatStack" component={ChatStack}
        options ={{ 
         headerShown: false,
         }}
         />
        <Tab.Screen name = "SocialStack" component={SocialStack} 
        options ={{ 
         headerShown: false,
         }}
         />
        <Tab.Screen name = "Profile" component={ProfileScreen} />
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
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
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
                 <Stack.Screen name="PawfectMatch" component={HomeTabNavigator}
                 options ={{ 
                  headerShown: false,
                  }}
                  />
            </Stack.Navigator>
            </GestureHandlerRootView>
    );
}
