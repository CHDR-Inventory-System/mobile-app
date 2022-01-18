import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Fonts } from '../global-styles';
import { RootStackParamsList } from './root-stack-params';

type MainScreeRouteProps = RouteProp<RootStackParamsList, 'Main'>;

const MainScreen = (): JSX.Element => {
  const route = useRoute<MainScreeRouteProps>();

  useEffect(() => {
    console.log(route.params?.name);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Main</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.text
  }
});

export default MainScreen;
