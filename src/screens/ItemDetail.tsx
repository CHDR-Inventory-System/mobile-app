import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Colors, Fonts } from '../global-styles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProps, RouteProps } from '../types/navigation';
import Button from '../components/Button';
import { Item } from '../types/API';
import BackTitleHeader from '../components/BackTitleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import CameraBottomSheet from '../components/detail/CameraBottomSheet';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import ImageCarousel from '../components/detail/ImageCarousel';
import { PortalHost } from '@gorhom/portal';
import useLoader from '../hooks/loading';
import useInventory from '../hooks/inventory';
import LoadingOverlay from '../components/Loading';

const ItemDetail = (): JSX.Element | null => {
  const { params } = useRoute<RouteProps<'ItemDetail'>>();
  const inventory = useInventory();

  // Because the inventory might be a large array to sort through, we need to
  // make sure we only search through it if an item in the inventory changes
  const item = useMemo(() => inventory.getItem(params.itemId), [inventory.state]);

  const { showActionSheetWithOptions } = useActionSheet();
  const [isCameraSheetShowing, setCameraSheetShowing] = useState(false);
  const navigation = useNavigation<NavigationProps>();
  const loader = useLoader();

  if (!item) {
    // The item will be null here if it was deleted. Deleting
    // an item causes this component to re-render.
    return null;
  }

  const goToEditScreen = () => {
    navigation.navigate('EditItemScreen', {
      itemId: params.itemId
    });
  };

  const goToChildItemDetailScreen = (childItem: Item) => {
    navigation.push('ItemDetail', {
      itemId: childItem.ID
    });
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
              onPress={() => goToChildItemDetailScreen(child)}
            />
          ))}
        </View>
      </>
    );
  };

  const deleteItem = async () => {
    loader.startLoading();
    await inventory.deleteItem(item.ID);
    loader.stopLoading();
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

  const addImage = async (image: CapturedPicture | ImagePicker.ImageInfo) => {
    // const filename = image.uri.split('/').pop();
    const { ID, images } = item;

    loader.startLoading();

    await inventory.uploadImage(ID, {
      ID: images.length === 0 ? 0 : images[images.length - 1].ID + 1,
      imagePath: image.uri,
      created: new Date().toLocaleDateString(),
      imageURL: image.uri
    });

    loader.stopLoading();
  };

  const choosePicture = async () => {
    loader.startLoading();

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      allowsEditing: false
    });

    loader.stopLoading();

    if (result.cancelled) {
      return;
    }

    addImage(result as ImagePicker.ImageInfo);
  };

  const renderImageActionSheet = async () => {
    const options = [
      {
        title: 'Take Photo',
        callback: () => setCameraSheetShowing(true)
      },
      {
        title: 'Choose From Library',
        callback: () => choosePicture()
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
          android: options.length - 1
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']} mode="margin">
      <BackTitleHeader title={item.name.replace(/[\n\r]+/g, '')} style={styles.header} />
      <PortalHost name="ItemDetail" />
      <LoadingOverlay loading={loader.isLoading} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentBody}>
          <ImageCarousel itemId={params.itemId} />
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
          {renderItemProperty(
            'Vendor Price',
            (item.vendorPrice && `$${item.vendorPrice}`) || ''
          )}

          {renderChildren()}

          <Button text="Edit Item" style={styles.actionButton} onPress={goToEditScreen} />
          <Button
            text="Upload Image"
            style={styles.actionButton}
            onPress={renderImageActionSheet}
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
      {isCameraSheetShowing && (
        <CameraBottomSheet
          onTakePicture={addImage}
          onClose={() => setCameraSheetShowing(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    zIndex: 11,
    paddingTop: Platform.select({
      ios: 12,
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
  },
  imageDeleteText: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize,
    textAlign: 'center',
    marginTop: 16
  }
});

export default ItemDetail;
