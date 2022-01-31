import React, { useState } from 'react';
import { StyleSheet, Image, View, Text, ViewStyle } from 'react-native';
import Button from './Button';
import { Item } from '../types/API';
import { Fonts } from '../global-styles';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';

type ItemCardProps = {
  item: Item;
  style?: ViewStyle;
};

const ItemCard = ({ item, style }: ItemCardProps): JSX.Element => {
  const [didImageFail, setDidImageFail] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  return (
    <View style={[styles.container, style]}>
      {didImageFail ? (
        // TODO: Move this to a component called <FallbackImage />
        <Image
          style={styles.image}
          source={require('../../assets/images/missing-image-placeholder.png')}
        />
      ) : (
        <Image
          style={styles.image}
          onError={() => setDidImageFail(true)}
          source={{ uri: item.images[0]?.imageURL || undefined }}
        />
      )}
      <Text style={styles.itemName}>{item.name.replace(/[\n\r]+/g, '')}</Text>
      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionSubtitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
      <Button text="View Item" onPress={() => navigation.navigate('ItemDetail', item)} />
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

    elevation: 5
  },
  image: {
    borderRadius: 8,
    width: '100%',
    height: 170,
    marginBottom: 32
    // backgroundColor: 'rgba(0, 0, 0, 0.07)'
  },
  itemName: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    marginBottom: 16,
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
  }
});

export default ItemCard;
