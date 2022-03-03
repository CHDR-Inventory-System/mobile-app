import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Button from './Button';
import { Item } from '../types/API';
import { Colors, Fonts } from '../global-styles';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import ImageWithFallback from './ImageWithFallback';
import { AntDesign } from '@expo/vector-icons';

type ItemCardProps = {
  item: Item;
  style?: ViewStyle;
};

const ItemCard = ({ item, style }: ItemCardProps): JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  const goToItemDetailScreen = () => {
    navigation.navigate('ItemDetail', {
      itemId: item.ID
    });
  };

  return (
    <View style={[styles.container, style]}>
      <ImageWithFallback
        style={styles.image}
        source={
          // Passing undefined if there are no images so that the
          // image component will show the "No image available" placeholder
          item.images.length === 0 ? undefined : { uri: item.images[0].imageURL }
        }
      />
      <Text style={styles.itemName}>{item.name.replace(/[\n\r]+/g, '')}</Text>
      <View style={styles.itemStatusContainer}>
        <Text style={styles.itemStatus}>Status: </Text>
        <Text
          style={{
            ...styles.itemStatus,
            color: item.available ? Colors.success : Colors.danger
          }}
        >
          {item.available ? 'Available' : 'Unavailable'}
        </Text>
        <AntDesign
          size={14}
          style={styles.itemStatusIcon}
          name={item.available ? 'checkcircle' : 'closecircle'}
          color={item.available ? Colors.success : Colors.danger}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionSubtitle}>Description</Text>
        <Text style={styles.description}>{item.description || 'No description available'}</Text>
      </View>

      <Button text="View Item" onPress={goToItemDetailScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    alignSelf: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 2
  },
  image: {
    borderRadius: 8,
    width: '100%',
    height: 180,
    marginBottom: 32
  },
  itemName: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    marginBottom: 8,
    lineHeight: 30
  },
  descriptionSubtitle: {
    fontFamily: Fonts.heading,
    fontSize: Fonts.defaultTextSize,
    marginBottom: 8
  },
  description: {
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.text,
    marginBottom: 16,
    lineHeight: 22
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 8
  },
  itemStatusContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemStatus: {
    fontFamily: Fonts.text,
    fontSize: Fonts.defaultTextSize
  },
  itemStatusIcon: {
    marginLeft: 6
  }
});

export default ItemCard;
