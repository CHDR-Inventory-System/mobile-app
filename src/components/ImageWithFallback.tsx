import React, { useState } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageURISource,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import useLoader from '../hooks/loading';

type ImageWithFallbackProps = {
  source?: ImageSourcePropType;
  style?: ImageStyle;
  onPress?: (hasError: boolean) => void;
  onLongPress?: () => void;
} & Omit<ImageProps, 'source'>;

/**
 * This component displays images and takes all the regular props an
 * {@link Image} does, however, it also displays a loading indicator while the
 * image loads and displays an error image if the image failed to load,
 * or a "no-image-available" image if this component received a falsy value
 * for the source.
 */
const ImageWithFallback = (props: ImageWithFallbackProps): JSX.Element => {
  const { source, style, onPress, onLongPress, ...imageProps } = props;
  const [didImageFail, setDidImageFail] = useState(false);
  const loader = useLoader();

  const onErrorImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(didImageFail);
    setDidImageFail(false);
    loader.startLoading();
  };

  const onImageLoadError = () => {
    setDidImageFail(true);
    loader.stopLoading();
  };

  const hapticLongPress = () => {
    if (!!onLongPress) {
      Haptics.impactAsync(
        Platform.select({
          ios: Haptics.ImpactFeedbackStyle.Medium,
          android: Haptics.ImpactFeedbackStyle.Light
        })
      );

      onLongPress();
    }
  };

  const renderLoader = () =>
    !loader.isLoading ? null : (
      <View
        style={{
          // Need to give this loading container the same width, height, and
          // border radius as the image so it doesn't cause the content to
          // shift when the image finishes loading.
          ...styles.loadingContainer,
          ...(style as ViewStyle),
          borderRadius: style?.borderRadius,
          width: style?.width,
          height: style?.height
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  const renderImage = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const errorImageSource = require('../../assets/images/error-image-placeholder.png');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const noImageSource = require('../../assets/images/no-image-placeholder.png');

    if (source === undefined || source === null) {
      return <Image style={style} source={noImageSource} {...imageProps} />;
    }

    if (didImageFail) {
      return (
        <TouchableOpacity
          onPress={onErrorImagePress}
          onLongPress={hapticLongPress}
          activeOpacity={0.7}
        >
          <Image style={style} source={errorImageSource} {...imageProps} />
        </TouchableOpacity>
      );
    }

    // Because image load events won't fire if the image URI is null
    // or undefined, we need to use some non-empty string to force those
    // events to fire.
    if (!(source as ImageURISource)?.uri) {
      (source as ImageURISource).uri = 'INVALID';
    }

    return (
      <TouchableOpacity
        onPress={() => onPress?.(false)}
        onLongPress={hapticLongPress}
        activeOpacity={!!onLongPress ? 0.8 : 1}
      >
        <Image
          style={style}
          onError={onImageLoadError}
          source={source}
          onLoadStart={loader.startLoading}
          onLoadEnd={loader.stopLoading}
          {...imageProps}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderLoader()}
      {renderImage()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(232, 233, 232)'
  }
});

export default ImageWithFallback;
