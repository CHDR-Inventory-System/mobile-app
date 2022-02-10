import React, { useEffect, useRef, useState } from 'react';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import { BarCodeScanner as ExpoBarcodeScanner } from 'expo-barcode-scanner';
import { View, StyleSheet, TouchableOpacity, Alert, Linking, Text } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '../global-styles';
import useLoader from '../hooks/loading';
import useInventory from '../hooks/inventory';
import { useActionSheet } from '@expo/react-native-action-sheet';
import LoadingOverlay from '../components/Loading';
import * as Haptics from 'expo-haptics';

const BarcodeScanner = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [isFlashOn, setFlash] = useState(false);
  const loader = useLoader();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation<NavigationProps>();
  const inventory = useInventory();
  const { showActionSheetWithOptions } = useActionSheet();

  const onBarcodeScanned = (barcode: BarCodeScanningResult) => {
    loader.startLoading();
    setHasScanned(true);
    setFlash(false);

    const inventoryItem = inventory.items.find(item => item.barcode === barcode.data);

    if (inventoryItem) {
      loader.stopLoading();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showActionSheetWithOptions(
        {
          options: ['Rescan', 'View Item', 'View Reservations', 'Create Reservation'],
          cancelButtonIndex: 0,
          textStyle: {
            fontFamily: Fonts.text
          }
        },
        buttonIndex => {
          if (buttonIndex === undefined) {
            return;
          }

          switch (buttonIndex) {
            case 0: // Rescan
              setHasScanned(false);
              break;
            case 1: // View Item
              navigation.navigate('ItemDetail', { itemId: inventoryItem.ID });
              break;
            case 2: // View Reservations
            case 3: // Create Reservation
              // TODO: Go to reservation screen here
              break;
          }
        }
      );
      return;
    }

    loader.stopLoading();
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'denied') {
      Alert.alert(
        'Camera Permission',
        "You'll need to enable camera permissions in order to use this feature.",
        [
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderRescanScreen = () =>
    hasScanned && !loader.isLoading ? (
      <TouchableOpacity
        style={styles.rescanContainer}
        activeOpacity={1}
        onPress={() => setHasScanned(false)}
      >
        <Text style={styles.rescanText}>Tap to rescan</Text>
      </TouchableOpacity>
    ) : null;

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (hasScanned) {
      cameraRef.current?.pausePreview();
    } else {
      cameraRef.current?.resumePreview();
    }
  }, [hasScanned]);

  if (!hasPermission) {
    return <LoadingOverlay loading />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderRescanScreen()}
      <LoadingOverlay loading={loader.isLoading} text="Loading..." />
      <Camera
        ref={cameraRef}
        ratio="16:9"
        flashMode={isFlashOn ? 'torch' : 'off'}
        style={styles.camera}
        barCodeScannerSettings={{
          barCodeTypes: [
            ExpoBarcodeScanner.Constants.BarCodeType.code39,
            ExpoBarcodeScanner.Constants.BarCodeType.code39mod43,
            ExpoBarcodeScanner.Constants.BarCodeType.code93,
            ExpoBarcodeScanner.Constants.BarCodeType.code128,
            ExpoBarcodeScanner.Constants.BarCodeType.ean8,
            ExpoBarcodeScanner.Constants.BarCodeType.ean13
          ]
        }}
        onBarCodeScanned={hasScanned ? undefined : onBarcodeScanned}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            ...styles.controls,
            paddingBottom: 16 + insets.bottom,
            paddingTop: 16 + insets.bottom
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={1}>
            <FontAwesome5 name="arrow-left" color="white" size={32} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFlash(!isFlashOn)} activeOpacity={1}>
            <Ionicons name={isFlashOn ? 'flash-off' : 'flash'} size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 56,
    paddingRight: 56,
    justifyContent: 'space-between'
  },
  rescanText: {
    fontFamily: Fonts.subtitle,
    fontSize: 24,
    color: '#FFF'
  },
  rescanContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    flexDirection: 'column'
  }
});

export default BarcodeScanner;
