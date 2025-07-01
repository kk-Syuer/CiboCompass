// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from './SearchScreen';
import DetailScreen from './DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Search"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Search"
          component={SearchScreen}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({ route }) => ({ title: route.params.dishName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
