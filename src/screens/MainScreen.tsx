import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ListRenderItemInfo, Alert } from 'react-native';
import { Fonts } from '../global-styles';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { Platform } from 'expo-modules-core';
import ItemCard from '../components/ItemCard';
import { Item } from '../types/API';
import EmptyInventoryContent from '../components/main/EmptyInventoryContent';
import LabeledInput from '../components/LabeledInput';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';
import API from '../util/API';

const MainScreen = (): JSX.Element => {
  // Because searching for items requires us to modify the main data source of
  // the FlatList component, we need to store the main items in a separate array
  // so we don't have to re-query the API every time a search is executed
  const [itemCache, setItemCache] = useState<Item[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const inventory = useInventory();
  const loader = useLoader();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();

  const searchItem = (query: string) => {
    if (!query) {
      inventory.setItems(itemCache);
      return;
    }

    const items = [...itemCache].filter(item =>
      item.name.toLowerCase().trim().includes(query.toLowerCase().trim())
    );

    inventory.setItems(items);
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

  const fetchInventory = async () => {
    loader.startLoading();

    try {
      const items = await API.getAllItems();
      inventory.setItems(items);
    } catch (err) {
      console.error(err);

      Alert.alert('Server Error', 'An unexpected error occurred, please try again.', [
        {
          text: 'Retry',
          onPress: fetchInventory
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]);
    }

    setItemCache(inventory.items);
    loader.stopLoading();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={<EmptyInventoryContent loading={loader.isLoading} />}
        data={inventory.items}
        renderItem={renderInventoryItem}
        refreshing={isRefreshing}
        keyExtractor={item => item.ID.toString()}
        initialNumToRender={5}
        onRefresh={onRefresh}
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
