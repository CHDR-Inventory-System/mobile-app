import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Alert,
  Platform
} from 'react-native';
import { Fonts } from '../global-styles';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SimpleLineIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import ItemCard from '../components/ItemCard';
import { Item } from '../types/API';
import EmptyInventoryContent from '../components/main/EmptyInventoryContent';
import LabeledInput from '../components/LabeledInput';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';

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
  const flatListRef = useRef<FlatList>(null);

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
    setRefreshing(true);

    try {
      const items = await inventory.init();
      setItemCache(items);
    } catch (err) {
      console.error(err);

      Alert.alert('Server Error', 'An unexpected error occurred, please try again.', [
        {
          text: 'Retry',
          onPress: () => fetchInventory()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]);
    }

    setRefreshing(false);
    loader.stopLoading();
  };

  const scrollToTop = () =>
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: 0
    });

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={<EmptyInventoryContent loading={loader.isLoading} />}
          data={inventory.items}
          renderItem={renderInventoryItem}
          refreshing={isRefreshing}
          keyExtractor={item => item.ID.toString()}
          initialNumToRender={5}
          onRefresh={fetchInventory}
          ref={flatListRef}
        />
        {inventory.items.length > 0 && (
          <Button
            onPress={scrollToTop}
            style={styles.toTopButton}
            iconStyle={styles.topTopIcon}
            icon={<FontAwesome5 name="chevron-up" size={16} color="#FFF" />}
          />
        )}
      </View>
      <Button
        text="Scan Barcode"
        textStyle={styles.scanButtonText}
        icon={<SimpleLineIcons name="camera" size={20} color="#FFF" />}
        style={{
          ...styles.scanButton,
          height: insets.bottom === 0 ? 56 : insets.bottom + 48
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
    height: 64,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center'
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
  },
  toTopButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16
  },
  topTopIcon: {
    marginLeft: 0
  }
});

export default MainScreen;
