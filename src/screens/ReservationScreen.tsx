import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList
} from 'react-native';
import BackTitleHeader from '../components/BackTitleHeader';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProps, RouteProps } from '../types/navigation';
import API from '../util/API';
import useLoader from '../hooks/loading';
import LoadingOverlay from '../components/Loading';
import useInventory from '../hooks/inventory';
import { Reservation, ReservationStatus } from '../types/API';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Fonts } from '../global-styles';
import moment from 'moment';
import mockReservations from '../../assets/mocks/reservations.json';
import { useActionSheet } from '@expo/react-native-action-sheet';
import LabeledInput from '../components/LabeledInput';
import Button from '../components/Button';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import StatusBottomSheet from '../components/reservation-screen/StatusBottomSheet';
import EmptyReservationList from '../components/reservation-screen/EmptyReservationList';

const statusColorMap: Record<ReservationStatus, string> = {
  Approved: '#BCF898',
  'Checked Out': '#3C8F0A',
  Denied: '#F89898',
  Late: '#F1DE32',
  Missed: '#EF3810',
  Pending: '#C8C8C8',
  Returned: '#5452F6'
};

const ReservationScreen = (): JSX.Element | null => {
  const { params } = useRoute<RouteProps<'ReservationScreen'>>();
  const navigation = useNavigation<NavigationProps>();
  const loader = useLoader();
  const inventory = useInventory();
  const item = useMemo(() => inventory.getItem(params.item.ID), []);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [isStatusSheetShowing, setStatusSheetShowing] = useState(false);
  const [filteredStatuses, setFilteredStatuses] = useState<ReservationStatus[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>(
    mockReservations as Reservation[]
  );
  // Because searching for reservations requires us to modify the main data source of
  // the FlatList component, we need to store the reservations in a separate array
  // so we don't have to re-query the API every time a search is executed
  const [reservationCache] = useState(mockReservations as Reservation[]);
  const { showActionSheetWithOptions } = useActionSheet();

  if (!item) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadReservations = async () => {
    loader.startLoading();

    try {
      const response = await API.getReservations(item.ID);
      console.log(response);
      setReservations(response);
    } catch (err) {
      console.log(err);
    }

    loader.stopLoading();
  };

  const openStatusActionSheet = (index: number) => {
    const options = Object.keys(statusColorMap) as ReservationStatus[];

    showActionSheetWithOptions(
      {
        options: [...options, 'Cancel'],
        cancelButtonIndex: options.length,
        destructiveButtonIndex: Platform.select({ android: options.length }),
        textStyle: {
          fontFamily: Fonts.text
        }
      },
      buttonIndex => {
        if (buttonIndex === undefined) {
          return;
        }

        // Cancel button was pressed
        if (buttonIndex === options.length) {
          return;
        }

        updateReservation(options[buttonIndex], index);
      }
    );
  };

  const updateReservation = (status: ReservationStatus, index: number) => {
    const updatedReservations = [...reservations];
    updatedReservations[index].status = status;

    setReservations(updatedReservations);
  };

  const searchStatus = (query: string) => {
    if (!query.trim()) {
      if (filteredStatuses.length === 0) {
        setReservations(reservationCache);
      } else {
        setReservations(
          reservationCache.filter(({ status }) => filteredStatuses.includes(status))
        );
      }
      return;
    }

    const filteredReservations = [...reservationCache].filter(
      reservation =>
        reservation.user.nid.toLowerCase().includes(query.toLowerCase()) ||
        reservation.user.email.toLowerCase().includes(query.toLowerCase()) ||
        reservation.user.fullName.toLowerCase().includes(query.toLowerCase())
    );

    setReservations(filteredReservations);
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <LabeledInput
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        editable={!loader.isLoading}
        label="Search"
        returnKeyType="search"
        onSubmitEditing={event => searchStatus(event.nativeEvent.text.trim())}
        placeholder="Search for an NID, email, or name..."
        clearButtonMode="always"
        labelStyle={styles.searchInputLabel}
      />
    </View>
  );

  const renderReservation = (reservation: Reservation, index: number) => (
    <TouchableOpacity
      style={styles.reservationRowContainer}
      key={reservation.ID}
      activeOpacity={0.6}
      onPress={() => openStatusActionSheet(index)}
    >
      <View
        style={{
          ...styles.reservationStatusBar,
          backgroundColor: statusColorMap[reservation.status]
        }}
      />
      <View style={{ paddingVertical: 2 }}>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>NID:</Text>
          <Text style={styles.reservationRowValue}>{reservation.user.nid}</Text>
        </View>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>Email:</Text>
          <Text style={styles.reservationRowValue}>{reservation.user.email}</Text>
        </View>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>Name:</Text>
          <Text style={styles.reservationRowValue}>{reservation.user.fullName}</Text>
        </View>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>Status:</Text>
          <Text style={styles.reservationRowValue}>{reservation.status}</Text>
        </View>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>Checkout:</Text>
          <Text style={styles.reservationRowValue}>
            {moment(reservation.startDateTime).format('MMMM Do YYYY h:mm A')}
          </Text>
        </View>
        <View style={styles.reservationRow}>
          <Text style={styles.reservationRowProperty}>Return:</Text>
          <Text style={styles.reservationRowValue}>
            {moment(reservation.endDateTime).format('MMMM Do YYYY h:mm A')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const scrollToTop = () =>
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: 0
    });

  useEffect(() => {
    // loadReservations();
  }, []);

  useEffect(() => {
    if (filteredStatuses.length === 0) {
      setReservations(reservationCache);
    } else {
      setReservations(
        reservationCache.filter(({ status }) => filteredStatuses.includes(status))
      );
    }
  }, [filteredStatuses]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} mode="margin">
      <StatusBar style="dark" />
      <BackTitleHeader title="Reservations" style={styles.header} />
      <LoadingOverlay loading={loader.isLoading} />
      <Text style={styles.subHeader}>Tap on any reservation to update its status</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          scrollEnabled={reservations.length > 0}
          ref={flatListRef}
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={renderSearchBar()}
          ListEmptyComponent={<EmptyReservationList loading={loader.isLoading} />}
          data={reservations}
          renderItem={({ item, index }) => renderReservation(item, index)}
          keyExtractor={reservation => reservation.ID.toString()}
        />
        {reservations.length > 0 && (
          <Button
            onPress={scrollToTop}
            style={styles.toTopButton}
            iconStyle={styles.buttonIcon}
            icon={<FontAwesome5 name="chevron-up" size={16} color="#FFF" />}
          />
        )}
        <Button
          onPress={() => setStatusSheetShowing(true)}
          style={styles.filterButton}
          iconStyle={styles.buttonIcon}
          icon={<FontAwesome5 name="filter" size={16} color="#FFF" />}
        />
      </View>
      <Button
        text="Create Reservation"
        textStyle={styles.addButtonText}
        icon={<AntDesign name="plus" size={20} color="#FFF" />}
        style={{
          ...styles.addButton,
          height: insets.bottom === 0 ? 56 : insets.bottom + 48
        }}
        onPress={() => navigation.navigate('AddReservationScreen', { item })}
      />
      {isStatusSheetShowing && (
        <StatusBottomSheet
          onClose={statuses => {
            setStatusSheetShowing(false);
            setFilteredStatuses(statuses);
          }}
          selectedStatuses={filteredStatuses || []}
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
      android: 16
    })
  },
  subHeader: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize,
    marginLeft: 24,
    paddingBottom: 24
  },
  reservationRowContainer: {
    marginVertical: 20,
    flexDirection: 'row'
  },
  reservationStatusBar: {
    width: 8,
    height: '100%',
    marginRight: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  reservationRow: {
    flexDirection: 'row',
    marginVertical: 2
  },
  reservationRowProperty: {
    fontFamily: Fonts.subtitle,
    fontSize: Fonts.defaultTextSize,
    marginRight: 8,
    lineHeight: 22
  },
  reservationRowValue: {
    fontFamily: Fonts.text,
    fontSize: Fonts.defaultTextSize,
    lineHeight: 22
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16
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
    bottom: 80,
    right: 16
  },
  buttonIcon: {
    marginLeft: 0
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16
  },
  addButton: {
    height: 64,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontFamily: Fonts.text,
    marginTop: Platform.select({
      ios: 3,
      android: 0
    })
  }
});

export default ReservationScreen;
