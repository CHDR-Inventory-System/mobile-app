import React, { useEffect, useRef, useState } from 'react';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import { BarCodeScanner as ExpoBarcodeScanner } from 'expo-barcode-scanner';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { StatusBar } from 'expo-status-bar';
import mockInventory from '../../assets/mocks/inventory.json';
import { Item } from '../types/API';
import { Fonts } from '../global-styles';

const Spacer = () => <View style={{ flex: 1 }} />;

const BarcodeScanner = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isFlashOn, setFlash] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation<NavigationProps>();

  const onBarcodeScanned = (barcode: BarCodeScanningResult) => {
    setHasScanned(true);
    setLoading(true);
    setFlash(false);

    const inventoryItem: Item | undefined = mockInventory.find(
      item => item.barcode.trim() === barcode.data.trim()
    );

    // TODO: Actually make an API call here
    if (inventoryItem) {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('ItemDetail', inventoryItem);
      }, 1000);

      return;
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const renderLoadingScreen = () =>
    isLoading ? (
      <View style={[styles.loadingContainer, styles.rescanContainer]}>
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
        <Text style={styles.rescanText}>Loading...</Text>
      </View>
    ) : null;

  const renderRescanScreen = () =>
    hasScanned && !isLoading ? (
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

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderLoadingScreen()}
      {renderRescanScreen()}
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
        <Spacer />
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
  cameraButton: {
    color: '#FFF'
  },
  loadingIndicator: {
    marginBottom: 36
  },
  rescanContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    flexDirection: 'column'
  },
  loadingContainer: {
    zIndex: 4
  },
  rescanText: {
    fontFamily: Fonts.subtitle,
    fontSize: 24,
    color: '#FFF'
  }
});

export default BarcodeScanner;
