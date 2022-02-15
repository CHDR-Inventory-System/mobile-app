import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors, Fonts } from '../../global-styles';
import LoadingOverlay from '../Loading';

type EmptyInventoryContentProps = {
  /**
   * If set to true, this will hide the content of the component
   * but the component will still fill the screen. This is so that
   * the MainScreen doesn't show a 'No Items' component while it's
   * loading items.
   */
  loading?: boolean;
};

const EmptyInventoryContent = ({
  loading = false
}: EmptyInventoryContentProps): JSX.Element => (
  <View style={styles.emptyContentContainer}>
    {loading ? (
      <LoadingOverlay
        text="Loading..."
        loading={loading}
        backdropStyle={styles.loaderBackdrop}
        textStyle={styles.loaderText}
        activityIndicatorColor={Colors.textMuted}
      />
    ) : (
      <>
        <FontAwesome5 name="barcode" size={128} style={styles.barcodeIcon} />
        <Text style={styles.emptyTextTitle}>No Items in Inventory</Text>
        <Text style={styles.emptyTextDescription}>Scan a barcode to get started.</Text>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  emptyContentContainer: {
    flexGrow: 1,
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
  barcodeIcon: {
    marginBottom: 32,
    alignSelf: 'center',
    color: Colors.text
  },
  loaderBackdrop: {
    backgroundColor: Colors.appBackgroundColor
  },
  loaderText: {
    color: Colors.textMuted
  }
});

export default EmptyInventoryContent;
