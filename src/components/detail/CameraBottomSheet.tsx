import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Alert,
  Linking
} from 'react-native';
import { Camera } from 'expo-camera';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import { Colors, Fonts } from '../../global-styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Platform } from 'expo-modules-core';
import LoadingOverlay from '../Loading';

type CameraBottomSheetProps = {
  onTakePicture?: (image: CapturedPicture) => void;
  onClose?: () => void;
};

const CameraBottomSheet = ({
  onTakePicture,
  onClose
}: CameraBottomSheetProps): JSX.Element | null => {
  const cameraRef = useRef<Camera>(null);
  const insets = useSafeAreaInsets();
  const [isCameraReady, setCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(false);
  const [loading, setLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  const closeBottomSheet = () => bottomSheetRef.current?.close();

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'denied') {
      Alert.alert(
        'Camera Permission',
        'You need to enable camera permissions in order to use this feature.',
        [
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          },
          {
            text: 'Close',
            onPress: closeBottomSheet,
            style: 'cancel'
          }
        ],
        {}
      );
    }
  };

  const renderOptionsActionSheet = (image: CapturedPicture) => {
    showActionSheetWithOptions(
      {
        title: "You image will be uploaded to CHDR's servers",
        options: ['Use This Picture', 'Retake'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: Platform.select({ android: 1 })
      },
      buttonIndex => {
        if (buttonIndex === undefined) {
          return;
        }

        if (buttonIndex === 1) {
          cameraRef.current?.resumePreview();
          return;
        }

        closeBottomSheet();
        onTakePicture?.(image);
      }
    );
  };

  const takePhoto = async () => {
    if (!isCameraReady) {
      return;
    }

    cameraRef.current?.pausePreview();

    setLoading(true);
    const image = await cameraRef.current?.takePictureAsync();
    setLoading(false);

    if (image) {
      renderOptionsActionSheet(image);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    setLoading(!isCameraReady);
  }, [isCameraReady]);

  const renderCamera = () => {
    if (!hasPermission) {
      return <LoadingOverlay loading={loading} style={styles.loader} />;
    }

    return (
      <Camera
        ratio="16:9"
        useCamera2Api
        ref={cameraRef}
        style={styles.camera}
        onCameraReady={() => setCameraReady(true)}
      >
        <LoadingOverlay loading={loading} />
        <View style={{ flex: 1 }} />
        <TouchableWithoutFeedback onPress={takePhoto}>
          <Entypo
            name="circle"
            size={72}
            color="white"
            style={{
              alignSelf: 'center',
              marginBottom: insets.bottom === 0 ? 18 : insets.bottom,
              marginTop: insets.bottom === 0 ? 18 : insets.bottom
            }}
          />
        </TouchableWithoutFeedback>
      </Camera>
    );
  };

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['100%']}
        enablePanDownToClose
        onClose={onClose}
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={styles.sheetHandle}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.cameraContainer}>
          <TouchableWithoutFeedback onPress={closeBottomSheet}>
            <View style={styles.cancelHeaderContainer}>
              <View
                style={{
                  ...styles.cancelHeader,
                  paddingTop: Platform.select({
                    ios: insets.top - 20,
                    android: insets.top - 8
                  })
                }}
              >
                <FontAwesome name="chevron-down" size={24} color="black" />
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
              <Text style={styles.cancelSubHeader}> Swipe down to close</Text>
            </View>
          </TouchableWithoutFeedback>
          {renderCamera()}
        </View>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: 'relative',
    zIndex: 10,
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'red'
  },
  cameraContainer: {
    backgroundColor: Colors.appBackgroundColor,
    flex: 1,
    width: '100%',
    height: '100%'
  },
  sheetHandle: {
    backgroundColor: Colors.appBackgroundColor,
    color: Colors.appBackgroundColor
  },
  handleIndicator: {
    backgroundColor: Colors.appBackgroundColor
  },
  swipeMessage: {
    fontFamily: Fonts.heading,

    fontSize: 24
  },
  cancelHeaderContainer: {
    paddingBottom: 16,
    paddingLeft: 24
  },
  cancelHeader: {
    flexDirection: 'row'
  },
  cancelText: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    marginLeft: 24,
    marginTop: Platform.select({ ios: 5 })
  },
  cancelSubHeader: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    marginTop: 8
  }
});

export default CameraBottomSheet;
