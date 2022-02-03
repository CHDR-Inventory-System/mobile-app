import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Colors, Fonts } from '../global-styles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProps, RouteProps } from '../types/navigation';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Item, ItemImage } from '../types/API';
import BackTitleHeader from '../components/BackTitleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

type CarouselItem<T> = {
  index: number;
  item: T;
};

const { width: viewportWidth } = Dimensions.get('window');

const ItemDetail = (): JSX.Element => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const { params: item } = useRoute<RouteProps<'ItemDetail'>>();
  const navigation = useNavigation<NavigationProps>();

  const goToEditScreen = (item: Item) => {
    navigation.navigate('EditItemScreen', item);
  };

  const goToItemDetailScreen = (item: Item) => {
    navigation.push('ItemDetail', item);
  };

  const renderItemProperty = (property: string, value: string | number | null) => {
    if (value === null || value === undefined || !value.toString().trim()) {
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
      return <ImageWithFallback style={[styles.fallbackImage, styles.image]} />;
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
        <View style={{ marginBottom: item.images.length === 1 ? 32 : 0 }}>
          <Pagination
            dotStyle={{ marginBottom: -6 }}
            dotsLength={item.images.length}
            activeDotIndex={activeCarouselIndex}
          />
        </View>
      </>
    );
  };

  const renderChildren = () => {
    if (!item.children || item.children?.length === 0) {
      return null;
    }

    return (
      <>
        <Text style={styles.itemChildrenHeader}>Children</Text>
        <Text style={styles.childrenSubtitle}>Tap an item to view its details</Text>
        <View style={styles.childrenList}>
          {item.children.map(child => (
            <Button
              activeOpacity={0.2}
              key={child.ID}
              text={child.name.replace(/[\n\r]+/g, '')}
              style={styles.itemChildButton}
              textStyle={styles.itemChildText}
              onPress={() => goToItemDetailScreen(child)}
            />
          ))}
        </View>
      </>
    );
  };

  const deleteItem = async () => {
    // TODO: Make API call here
    navigation.pop();
  };

  const showDeleteItemAlert = () => {
    const title = item.main ? 'Delete Item' : 'Delete Child Item';

    const message = item.main
      ? 'Are you sure? This will delete all children, images, and reservations associated with this item.'
      : 'Are you sure? This will delete all, images, and reservations associated with this item (the parent item will not be deleted).';

    Alert.alert(title, message, [
      {
        text: 'Delete',
        onPress: deleteItem,
        style: 'destructive'
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <BackTitleHeader title={item.name.replace(/[\n\r]+/g, '')} style={styles.header} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentBody}>
          {renderImages()}
          {!!item.description && (
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
          {renderItemProperty('Created', moment(item.created).format('MMMM Do YYYY'))}
          {renderItemProperty('Type', item.type)}
          {renderItemProperty(
            'Purchase Date',
            item.purchaseDate && moment(item.purchaseDate).format('MMMM Do YYYY')
          )}
          {renderItemProperty('Vendor Name', item.vendorName)}
          {renderItemProperty('Vendor Price', item.vendorPrice)}

          {renderChildren()}

          <Button
            text="Edit Item"
            style={styles.actionButton}
            onPress={() => goToEditScreen(item)}
          />
          {item.main && <Button text="Add Child Item" style={styles.actionButton} />}
          <Button
            text="Delete Item"
            style={styles.actionButton}
            variant="danger"
            onPress={showDeleteItemAlert}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    marginTop: Platform.select({
      ios: 8,
      android: 32
    })
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
    marginBottom: 16,
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
  actionButton: {
    marginTop: 16
  },
  itemChildrenHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Fonts.heading,
    fontSize: 28
  },
  childrenSubtitle: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
    fontSize: Fonts.defaultTextSize
  },
  itemChildButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 8,
    alignItems: 'flex-start'
  },
  itemChildText: {
    color: '#000',
    fontFamily: Fonts.text
  },
  childrenList: {
    marginBottom: 16
  }
});

export default ItemDetail;
