import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../global-styles';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { platformValue } from '../util/platform';
import { SimpleLineIcons, FontAwesome5 } from '@expo/vector-icons';

const EmptyInventoryContent = () => (
  <View style={styles.emptyContentContainer}>
    <FontAwesome5 name="barcode" size={128} style={styles.barcodeIcon} />
    <Text style={styles.emptyTextTitle}>No Items in Inventory</Text>
    <Text style={styles.emptyTextDescription}>Scan a barcode to get started.</Text>
  </View>
);

const MainScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();

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
