import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import Navbar from './src/components/Navbar';
import { Portal, PortalProvider } from '@gorhom/portal';
import { RootStackParamsList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamsList>();

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
    <PortalProvider>
      <Portal>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              gestureEnabled: false,
              contentStyle: {
                backgroundColor: '#FFF'
              },
              header: () => <Navbar />
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ headerShown: true }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Portal>
    </PortalProvider>
  );
};

export default App;
