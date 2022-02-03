import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { StyleSheet, View, Text, Alert, Platform } from 'react-native';
import { Colors, Fonts } from '../../global-styles';
import { Item, ItemImage } from '../../types/API';
import ImageWithFallback from '../../components/ImageWithFallback';
import Button from '../../components/Button';
import { useActionSheet } from '@expo/react-native-action-sheet';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type ImageEditListProps = {
  onLoadStateChange: (isLoading: boolean) => void;
};

/**
 * Handles rendering and deleting images in the edit screen. This kept in
 * a separate component to make state management in the edit screen easier
 */
const ImageEditList = ({ onLoadStateChange }: ImageEditListProps): JSX.Element => {
  const context = useFormikContext<Item>();
  const { showActionSheetWithOptions } = useActionSheet();
  const [images, setImages] = useState([...context.values.images]);

  const deleteImage = async (image: ItemImage) => {
    // TODO: Make API call here
    onLoadStateChange(true);
    await sleep(1000);
    setImages(prevState => prevState.filter(({ ID }) => image.ID !== ID));
    onLoadStateChange(false);
  };

  const confirmDelete = (image: ItemImage) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteImage(image)
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]);
  };

  const renderImages = () => {
    return (
      <View style={styles.imageList}>
        {images.map(image => (
          <ImageWithFallback
            onLongPress={() => confirmDelete(image)}
            source={{ uri: image.imageURL }}
            key={image.ID}
            style={styles.image}
          />
        ))}
      </View>
    );
  };

  const renderImageActionSheet = () => {
    const options = [
      {
        title: 'Take Photo',
        callback: () => {}
      },
      {
        title: 'Choose From Library',
        callback: () => {}
      },
      {
        title: 'Cancel'
      }
    ];

    showActionSheetWithOptions(
      {
        options: options.map(({ title }) => title),
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: Platform.select({
          android: options.length  - 1
        }),
        textStyle: {
          fontFamily: Fonts.text
        }
      },
      buttonIndex => {
        if (buttonIndex !== undefined) {
          options[buttonIndex].callback?.();
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Images</Text>
      <Text style={styles.subTitle}>Tap and hold an image to remove it</Text>
      {renderImages()}
      <Button text="Upload Image" onPress={renderImageActionSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    marginBottom: 8
  },
  subTitle: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    marginTop: 4,
    fontSize: Fonts.defaultTextSize
  },
  imageList: {
    marginTop: 4,
    marginBottom: 24
  },
  image: {
    marginTop: 16,
    borderRadius: 8,
    width: '100%',
    alignSelf: 'center',
    height: 200
  }
});

export default ImageEditList;
