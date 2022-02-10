import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import Navbar from './src/components/Navbar';
import { PortalProvider } from '@gorhom/portal';
import { RootStackParamsList } from './src/types/navigation';
import BarcodeScanner from './src/screens/BarcodeScanner';
import { Colors } from './src/global-styles';
import ItemDetail from './src/screens/ItemDetail';
import { UserProvider } from './src/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './src/types/API';
import EditItemScreen from './src/screens/EditItemScreen';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InventoryProvider } from './src/contexts/InventoryContext';
import { StatusBar } from 'expo-status-bar';
import useLoader from './src/hooks/loading';

const Stack = createNativeStackNavigator<RootStackParamsList>();

const App = (): JSX.Element => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamsList>('Main');
  const [initialUserValue, setInitialUserValue] = useState<User | undefined>(undefined);
  const loader = useLoader(true);
  const [fontsLoaded, fontLoadError] = useFonts({
    'Gotham-Book': require('./assets/fonts/Gotham-Book.ttf'),
    'Gotham-Medium': require('./assets/fonts/Gotham-Medium.ttf'),
    'Gotham-Bold': require('./assets/fonts/Gotham-Bold.ttf')
  });

  const loadUserFromStorage = () => {
    // If the user was previously logged in, grab their credentials
    // from AsyncStorage, set the the user context object,
    // then take them to the main screen
    AsyncStorage.getItem('user')
      .then(user => JSON.parse(user || '') as User)
      .then(user => {
        if (user.token) {
          setInitialUserValue(user);
          setInitialRoute('Main');
        }
      })
      .catch(() => {
        // This catch block is needed to silence "unhandled rejection" errors
      })
      .finally(loader.stopLoading);
  };

  const stack = (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
      <Stack.Screen name="Main" component={MainScreen} />
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
          headerShown: false,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="EditItemScreen"
        component={EditItemScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (fontLoadError) {
      console.error('Error loading fonts', fontLoadError);
    }
  }, [fontLoadError]);

  if (!fontsLoaded || loader.isLoading) {
    return <AppLoading />;
  }

  return (
    <SafeAreaProvider>
      <ActionSheetProvider>
        <UserProvider initialValue={initialUserValue}>
          <InventoryProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <PortalProvider>{stack}</PortalProvider>
            </NavigationContainer>
          </InventoryProvider>
        </UserProvider>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
};

export default App;
