import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Alert,
  Linking,
  Image,
  BackHandler,
  Platform
} from 'react-native';
import { Camera } from 'expo-camera';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import { Colors, Fonts } from '../../global-styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import LoadingOverlay from '../Loading';
import * as Haptics from 'expo-haptics';
import useLoader from '../../hooks/loading';

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
  const loader = useLoader();
  const { showActionSheetWithOptions } = useActionSheet();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [imageUri, setImageUri] = useState('');

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
        "You'll need to enable camera permissions in order to use this feature.",
        [
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          },
          {
            text: 'Cancel',
            onPress: closeBottomSheet,
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderOptionsActionSheet = (image: CapturedPicture) => {
    showActionSheetWithOptions(
      {
        title: "Your image will be uploaded to CHDR's server",
        options: ['Use This Picture', 'Retake'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: Platform.select({ android: 1 }),
        textStyle: {
          fontFamily: Fonts.text
        }
      },
      buttonIndex => {
        if (buttonIndex === undefined) {
          return;
        }

        if (buttonIndex === 1) {
          setImageUri('');
          cameraRef.current?.resumePreview();
          return;
        }

        closeBottomSheet();
        onTakePicture?.(image);
      }
    );
  };

  const takePhoto = async () => {
    if (!isCameraReady || loader.isLoading) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    loader.startLoading();

    const image = await cameraRef.current?.takePictureAsync({
      base64: true
    });

    if (image?.uri) {
      setImageUri(image.uri);
    }

    cameraRef.current?.pausePreview();

    loader.stopLoading();

    if (image) {
      renderOptionsActionSheet(image);
    }
  };

  const onBackPress = () => {
    closeBottomSheet();
    // Returning true here to prevent going back to the previous screen
    // when the back button is pressed
    return true;
  };

  useEffect(() => {
    requestCameraPermission();
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  useEffect(() => {
    loader.toggleLoading(!isCameraReady);
  }, [isCameraReady]);

  const renderCamera = () => {
    if (!hasPermission) {
      return <LoadingOverlay loading={loader.isLoading} style={styles.loader} />;
    }

    return (
      <Camera
        ref={cameraRef}
        style={styles.camera}
        onCameraReady={() => setCameraReady(true)}
      >
        {
          // TODO: A bug on some android devices causes the camera not to render
          // if the loading overlay is present here
          Platform.OS === 'ios' && <LoadingOverlay loading={loader.isLoading} />
        }
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

  const renderImagePreview = () => {
    if (!imageUri) {
      return null;
    }

    return (
      <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.imagePreview} />
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
          {renderImagePreview()}
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
  },
  imagePreview: {
    height: '100%',
    width: '100%'
  }
});

export default CameraBottomSheet;
