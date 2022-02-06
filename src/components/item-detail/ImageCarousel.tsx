import React, { useMemo, useState } from 'react';
import { ItemImage } from '../../types/API';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageWithFallback from '../ImageWithFallback';
import { Colors, Fonts } from '../../global-styles';
import LoadingOverlay from '../Loading';
import useLoader from '../../hooks/loading';
import useInventory from '../../hooks/inventory';

type CarouselItem<T> = {
  index: number;
  item: T;
};

type ImageCarouselProps = {
  itemId: number;
};

const { width: viewportWidth } = Dimensions.get('window');

const ImageCarousel = ({ itemId }: ImageCarouselProps): JSX.Element => {
  const inventory = useInventory();
  const loader = useLoader();
  const images = useMemo(() => inventory.getImages(itemId), [inventory.items]);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const deleteImage = async (image: ItemImage) => {
    loader.startLoading();

    try {
      await inventory.deleteImage(itemId, image.ID);
    } catch (err) {
      console.error(err);
      Alert.alert('Server Error', 'An unexpected error occurred, please try again.');
    }

    loader.stopLoading();
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

  const renderImage = ({ item }: CarouselItem<ItemImage>) => (
    <ImageWithFallback
      style={styles.image}
      source={{ uri: item.imageURL }}
      onLongPress={() => confirmDelete(item)}
    />
  );

  if (images.length === 0) {
    return <ImageWithFallback style={[styles.image, styles.fallbackImage]} />;
  }

  return (
    <View>
      <LoadingOverlay loading={loader.isLoading} portalHostName="ItemDetail" />
      <Carousel
        data={images}
        renderItem={renderImage}
        sliderWidth={viewportWidth * 0.93}
        itemWidth={viewportWidth * 0.93}
        onSnapToItem={setActiveCarouselIndex}
      />
      {images.length > 0 && (
        <Text style={styles.imageDeleteText}>Tap and hold an image to delete it</Text>
      )}
      <View style={{ marginBottom: images.length === 1 ? 32 : 0 }}>
        <Pagination
          dotStyle={{ marginBottom: -6 }}
          dotsLength={images.length}
          activeDotIndex={activeCarouselIndex}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackImage: {
    marginBottom: 24,
    height: 200
  },
  image: {
    marginTop: 16,
    borderRadius: 8,
    width: '100%',
    alignSelf: 'center',
    height: 400
  },
  imageDeleteText: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize,
    textAlign: 'center',
    marginTop: 16
  }
});

export default ImageCarousel;
