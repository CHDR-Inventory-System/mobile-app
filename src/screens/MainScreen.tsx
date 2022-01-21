import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../global-styles';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { platformValue } from '../util/platform';
import { SimpleLineIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { Platform } from 'expo-modules-core';

const EmptyInventoryContent = () => (
  <View style={styles.emptyContentContainer}>
    <FontAwesome5 name="barcode" size={128} style={styles.barcodeIcon} />
    <Text style={styles.emptyTextTitle}>No Items in Inventory</Text>
    <Text style={styles.emptyTextDescription}>Scan a barcode to get started.</Text>
  </View>
);

const MainScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    // Prevents the user from going back to the login screen
    // if the back button was pressed. This will only apply to
    // Androids since iPhones don't have a back button
    navigation.addListener('beforeRemove', event => {
      if (Platform.OS === 'android' && event.data.action.type === 'GO_BACK') {
        event.preventDefault();
        return;
      }

      navigation.dispatch(event.data.action);
    });
  }, []);

  return (
    <View style={styles.container}>
      <EmptyInventoryContent />
      <Button
        text="Scan Barcode"
        textStyle={styles.scanButtonText}
        icon={<SimpleLineIcons name="camera" size={20} color="#FFF" />}
        style={{
          ...styles.scanButton,
          paddingBottom: platformValue(16, 0) + insets.bottom,
          paddingTop: platformValue(16, 0) + insets.bottom
        }}
        onPress={() => navigation.navigate('BarcodeScanner')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 84,
    alignItems: 'center'
  },
  emptyTextTitle: {
    fontSize: 24,
    color: Colors.text,
    fontFamily: Fonts.heading,
    marginBottom: 16
  },
  emptyTextDescription: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize
  },
  scanButton: {
    borderRadius: 0
  },
  scanButtonText: {
    fontFamily: Fonts.text,
    marginTop: platformValue(0, 3)
  },
  barcodeIcon: {
    marginBottom: 32,
    alignSelf: 'center',
    color: Colors.text
  }
});

export default MainScreen;
