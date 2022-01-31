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
import BarcodeScanner from './src/screens/BarcodeScanner';
import { Colors } from './src/global-styles';
import ItemDetail from './src/screens/ItemDetail';

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
            initialRouteName="Main"
            screenOptions={{
              gestureEnabled: false,
              contentStyle: {
                backgroundColor: Colors.appBackgroundColor
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
            <Stack.Screen
              name="BarcodeScanner"
              component={BarcodeScanner}
              options={{
                headerShown: false,
                gestureEnabled: true
              }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetail}
              options={{
                headerShown: true,
                gestureEnabled: true
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Portal>
    </PortalProvider>
  );
};

export default App;
