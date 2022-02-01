import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Fonts } from '../global-styles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProps, NavigationProps } from '../types/navigation';
import { AntDesign } from '@expo/vector-icons';
import { platformValue } from '../util/platform';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { ItemImage } from '../types/API';

type CarouselItem<T> = {
  index: number;
  item: T;
};

const { width: viewportWidth } = Dimensions.get('window');

const formatDate = (date: string | null) =>
  date === null
    ? null
    : new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

const ItemDetail = (): JSX.Element => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const { params: item } = useRoute<RouteProps<'ItemDetail'>>();
  const navigation = useNavigation<NavigationProps>();

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
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={32} color="black" style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.name.replace(/[\n\r]+/g, '')}</Text>
        </View>
      </View>
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
        {renderItemProperty('Created', formatDate(item.created))}
        {renderItemProperty('Type', item.type)}
        {renderItemProperty('Purchase Date', formatDate(item.purchaseDate))}
        {renderItemProperty('Vendor Name', item.vendorName)}
        {renderItemProperty('Vendor Price', item.vendorPrice)}
        <Button text="Edit Item" style={styles.editItemButton} />
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
  icon: {
    marginRight: 16
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row'
  },
  itemNameContainer: {
    // Necessary because of a bug in React Native
    // https://stackoverflow.com/a/47254969/9124220
    // https://github.com/facebook/react-native/issues/1438
    width: 0,
    flexGrow: 1,
    flex: 1
  },
  itemName: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 30,
    flexShrink: 1,
    marginTop: platformValue(0, 4)
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
