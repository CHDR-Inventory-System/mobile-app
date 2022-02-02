import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItemInfo
} from 'react-native';
import { Fonts } from '../global-styles';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { Platform } from 'expo-modules-core';
import mockInventory from '../../assets/mocks/inventory.json';
import ItemCard from '../components/ItemCard';
import { Item } from '../types/API';
import EmptyInventoryContent from '../components/EmptyInventoryContent';
import LabeledInput from '../components/LabeledInput';

const MainScreen = (): JSX.Element => {
  const [inventoryItems, setInventoryItems] = useState<Item[]>(mockInventory);
  // Because searching for items requires us to modify the main data source of
  // the FlatList component, we need to store the main items in a separate array
  // so we don't have to re-query the API every time a search is cleared
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [itemCache, setItemCache] = useState<Item[]>(mockInventory);
  const [isRefreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();

  const searchItem = (query: string) => {
    if (!query) {
      setInventoryItems(itemCache);
      return;
    }

    const items = [...itemCache].filter(item =>
      item.name.toLowerCase().trim().includes(query.toLowerCase().trim())
    );

    setInventoryItems(items);
  };

  const renderInventoryItem = ({ item }: ListRenderItemInfo<Item>) => (
    <ItemCard item={item} style={styles.itemCard} />
  );

  const renderListHeader = () => (
    <View style={styles.searchContainer}>
      <LabeledInput
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        editable={!isRefreshing}
        label="Search"
        returnKeyType="search"
        onSubmitEditing={event => searchItem(event.nativeEvent.text.trim())}
        placeholder="Search for an item by name..."
        clearButtonMode="always"
        labelStyle={styles.searchInputLabel}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={<EmptyInventoryContent refreshing={isRefreshing} />}
        data={inventoryItems}
        renderItem={renderInventoryItem}
        refreshing={isRefreshing}
        keyExtractor={item => item.ID.toString()}
        initialNumToRender={5}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
            setInventoryItems([...inventoryItems].sort(() => 0.5 - Math.random()));
          }, 1000);
        }}
      />
      <Button
        text="Scan Barcode"
        textStyle={styles.scanButtonText}
        icon={<SimpleLineIcons name="camera" size={20} color="#FFF" />}
        style={{
          ...styles.scanButton,
          paddingBottom: insets.bottom === 0 ? 18 : insets.bottom,
          paddingTop: insets.bottom === 0 ? 18 : insets.bottom
        }}
        onPress={() => navigation.navigate('BarcodeScanner')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  scanButton: {
    borderRadius: 0
  },
  scanButtonText: {
    fontFamily: Fonts.text,
    marginTop: Platform.select({
      ios: 3,
      android: 0
    })
  },
  itemCard: {
    marginVertical: 24,
    width: '90%'
  },
  searchContainer: {
    width: '87%',
    alignSelf: 'center',
    marginTop: 8
  },
  searchInputLabel: {
    fontSize: 24,
    marginBottom: 22
  }
});

export default MainScreen;
