import React, { useState } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

type ImageWithFallbackProps = {
  source: ImageSourcePropType | null;
  style?: ImageStyle;
} & Omit<ImageProps, 'source'>;

/**
 * This component displays images and takes all the regular props an
 * {@link Image} does, however, it also displays a loading indicator while the
 * image loads and displays an error image if the image failed to load,
 * or a "no-image-available" image if this component received an empty string
 * for the source.
 */
const ImageWithFallback = (props: ImageWithFallbackProps): JSX.Element => {
  const [didImageFail, setDidImageFail] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { source, style, ...imageProps } = props;

  const onErrorImagePress = () => {
    setDidImageFail(false);
    setLoading(true);
  };

  const onImageLoadError = () => {
    setDidImageFail(true);
    setLoading(false);
  };

  const renderLoader = () =>
    !isLoading ? null : (
      <View
        style={{
          // Need to give this loading container the same width, height, and
          // border radius as the image so it doesn't cause the content to
          // shift when the image finishes loading.
          ...styles.loadingContainer,
          borderRadius: style?.borderRadius,
          width: style?.width,
          height: style?.height
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  const renderImage = () => {
    const errorImageSource = didImageFail
      ? require('../../assets/images/error-image-placeholder.png')
      : require('../../assets/images/no-image-placeholder.png');

    // If the image fails to load, we need to show the "error image" place holder.
    // If there is no image, we'll just show the "no image" placeholder.
    if (didImageFail || !source || !(source as ImageURISource).uri) {
      return (
        <TouchableOpacity
          onPress={didImageFail ? onErrorImagePress : undefined}
          activeOpacity={didImageFail ? 0.7 : 1}
        >
          <Image style={style} source={errorImageSource} {...imageProps} />
        </TouchableOpacity>
      );
    }

    return (
      <Image
        style={style}
        onError={onImageLoadError}
        source={source}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        {...imageProps}
      />
    );
  };

  return (
    <View>
      {renderLoader()}
      {renderImage()}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(232, 233, 232)'
  }
});

export default ImageWithFallback;
