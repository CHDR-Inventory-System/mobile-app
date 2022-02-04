import React, { useEffect, useRef, useState } from 'react';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import { BarCodeScanner as ExpoBarcodeScanner } from 'expo-barcode-scanner';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { StatusBar } from 'expo-status-bar';

const Spacer = () => <View style={{ flex: 1 }} />;

const BarcodeScanner = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isFlashOn, setFlash] = useState(false);
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>();
  const navigation = useNavigation<NavigationProps>();

  const onBarcodeScanned = (barcode: BarCodeScanningResult) => {
    setHasScanned(true);
    cameraRef.current?.pausePreview();

    Alert.alert('Barcode Scanned', barcode.data, [
      {
        text: 'OK',
        onPress: () => {
          setHasScanned(false);
          cameraRef.current?.resumePreview();
        }
      }
    ]);
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

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
      <Camera
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
  }
});

export default BarcodeScanner;
