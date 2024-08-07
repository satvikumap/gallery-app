import {View,StatusBar } from 'react-native'
import Explors from './Screens/Explors';
import Album from './Screens/Album';
import Photos from './Screens/Photos'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
    <View style={{flex:1,backgroundColor:"#000000"}}>
    <StatusBar  backgroundColor={'black'}/>
      <Tab.Navigator   screenOptions={{
        tabBarStyle: {
        backgroundColor: '#000000'
        },
        headerShown:false,
        }}>
        <Tab.Screen name="Photos" component={Photos} options={{
          tabBarIcon: ({focused}) => (
            <Icons name="image" size={28} color={focused ? "#FFFFFF" : "#6b6565"} />
          ),
        }}/>
        <Tab.Screen name="Album" component={Album}  options={{
          tabBarIcon: ({focused}) => (
            <Icons name="albums" size={28} color={focused ? "#FFFFFF" : "#6b6565"} />
          ),
        }}/>
        <Tab.Screen name="Explors" component={Explors}  options={{
          tabBarIcon: ({focused}) => (
            <Icons name="planet" size={28} color={focused ? "#FFFFFF" : "#6b6565"} />
          ),
        }}/>
      </Tab.Navigator>
    </View>
    </NavigationContainer>
  )
}

export default App;

