import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Fonts } from '../global-styles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProps, RouteProps } from '../types/navigation';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { ItemImage } from '../types/API';
import BackTitleHeader from '../components/BackTitleHeader';
import { formatDate } from '../util/date';

type CarouselItem<T> = {
  index: number;
  item: T;
};

const { width: viewportWidth } = Dimensions.get('window');

const ItemDetail = (): JSX.Element => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const { params: item } = useRoute<RouteProps<'ItemDetail'>>();
  const navigation = useNavigation<NavigationProps>();

  const goToEditScreen = () => {
    navigation.navigate('EditItemScreen', item);
  };

  const renderItemProperty = (property: string, value: string | number | null) => {
    if (!value) {
      return null;
    }

    return (
      <View style={styles.itemProperty}>
        <Text style={styles.itemPropertyName}>{property}:</Text>
        <Text style={styles.itemPropertyValue}>{value}</Text>
      </View>
    );
  };

  const renderImage = ({ item }: CarouselItem<ItemImage>) => (
    <ImageWithFallback style={styles.image} source={{ uri: item.imageURL }} />
  );

  const renderImages = () => {
    // If this item has no images, we still want to show the
    // "no-image-available" placeholder image
    if (item.images.length === 0) {
      return (
        <ImageWithFallback style={[styles.fallbackImage, styles.image]} source={null} />
      );
    }

    return (
      <>
        <Carousel
          data={item.images}
          renderItem={renderImage}
          sliderWidth={viewportWidth * 0.93}
          itemWidth={viewportWidth * 0.93}
          onSnapToItem={index => setActiveCarouselIndex(index)}
        />
        <Pagination
          dotsLength={item.images.length}
          activeDotIndex={activeCarouselIndex}
        />
      </>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <BackTitleHeader title={item.name.replace(/[\n\r]+/g, '')} />
      <View style={styles.contentBody}>
        {renderImages()}
        {item.description && (
          <>
            <Text style={styles.descriptionSubtitle}>Description:</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </>
        )}
        {renderItemProperty('Location', item.location)}
        {renderItemProperty('Barcode', item.barcode)}
        {renderItemProperty('Quantity', item.quantity)}
        {renderItemProperty('Status', item.available ? 'Available' : 'Unavailable')}
        {renderItemProperty('Movable', item.moveable ? 'Yes' : 'No')}
        {renderItemProperty('Serial', item.serial)}
        {renderItemProperty('Created', formatDate(item.created, false))}
        {renderItemProperty('Type', item.type)}
        {renderItemProperty('Purchase Date', formatDate(item.purchaseDate, false))}
        {renderItemProperty('Vendor Name', item.vendorName)}
        {renderItemProperty('Vendor Price', item.vendorPrice)}
        <Button text="Edit Item" style={styles.editItemButton} onPress={goToEditScreen} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentBody: {
    width: '93%',
    alignSelf: 'center',
    marginBottom: 32
  },
  image: {
    marginTop: 16,
    borderRadius: 8,
    width: '100%',
    alignSelf: 'center',
    height: 200
  },
  fallbackImage: {
    marginBottom: 24
  },
  descriptionSubtitle: {
    fontFamily: Fonts.subtitle,
    fontSize: Fonts.defaultTextSize,
    marginBottom: 12
  },
  itemDescription: {
    fontFamily: Fonts.text,
    fontSize: Fonts.defaultTextSize,
    marginBottom: 20,
    lineHeight: 22
  },
  itemProperty: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20
  },
  itemPropertyName: {
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.subtitle,
    marginRight: 8
  },
  itemPropertyValue: {
    fontFamily: Fonts.text,
    fontSize: Fonts.defaultTextSize
  },
  editItemButton: {
    marginVertical: 16
  }
});

export default ItemDetail;
