import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  const [fontsLoaded] = useFonts({
    'Gotham-Book': require('./assets/fonts/Gotham-Book.ttf'),
    'Gotham-Medium': require('./assets/fonts/Gotham-Medium.ttf'),
    'Gotham-Bold': require('./assets/fonts/Gotham-Bold.ttf')
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="loginc">
        <Stack.Screen
          name="login"
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            contentStyle: {
              backgroundColor: 'white'
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
