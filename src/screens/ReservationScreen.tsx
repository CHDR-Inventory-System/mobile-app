import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  Alert as RNAlert
} from 'react-native';
import BackTitleHeader from '../components/BackTitleHeader';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProps, RouteProps } from '../types/navigation';
import useLoader from '../hooks/loading';
import { Reservation, ReservationStatus } from '../types/API';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Fonts } from '../global-styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import LabeledInput from '../components/LabeledInput';
import Button from '../components/Button';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import StatusBottomSheet from '../components/reservation-screen/StatusBottomSheet';
import EmptyReservationList from '../components/reservation-screen/EmptyReservationList';
import useReservations from '../hooks/reservation';
import ReservationListItem from '../components/reservation-screen/ReservationListItem';
import * as Haptics from 'expo-haptics';
import useUser from '../hooks/user';
import Alert from '../components/Alert';

const ReservationScreen = (): JSX.Element | null => {
  const {
    params: { item }
  } = useRoute<RouteProps<'ReservationScreen'>>();
  const navigation = useNavigation<NavigationProps>();
  const loader = useLoader();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const reservation = useReservations();
  const [isStatusSheetShowing, setStatusSheetShowing] = useState(false);
  // This is initially set to null so that the useEffect hook doesn't try to set the
  // reservations to an empty array when the component is mounted
  const [filteredStatuses, setFilteredStatuses] = useState<ReservationStatus[] | null>(
    null
  );
  // Because searching for reservations requires us to modify the main data source of
  // the FlatList component, we need to store the reservations in a separate array
  // so we don't have to re-query the API every time a search is executed
  const [reservationCache, setReservationCache] = useState<Reservation[]>([]);
  const { showActionSheetWithOptions } = useActionSheet();
  const user = useUser();

  const loadReservations = async () => {
    try {
      const reservations = await reservation.init(item.item);
      setReservationCache(reservations);
    } catch (err) {
      console.error(err);
      RNAlert.alert(
        'Unexpected Error',
        'An error occurred while loading reservations for this item',
        [
          {
            text: 'Retry',
            onPress: loadReservations
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const updateReservationStatus = async (
    reservationId: number,
    status: ReservationStatus
  ) => {
    loader.startLoading();

    try {
      await reservation.updateStatus(reservationId, user.state.ID, status);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
      RNAlert.alert(
        'Unexpected Error',
        "An error occurred while updating this reservation's status",
        [
          {
            text: 'Retry',
            onPress: () => updateReservationStatus(reservationId, status)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }

    loader.stopLoading();
  };

  const openStatusActionSheet = (res: Reservation) => {
    const options: ReservationStatus[] = [
      'Approved',
      'Cancelled',
      'Checked Out',
      'Denied',
      'Late',
      'Missed',
      'Pending',
      'Returned'
    ];

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

        updateReservationStatus(res.ID, options[buttonIndex]);
      }
    );
  };

  const searchStatus = (query: string) => {
    const statuses = reservation.reservations.map(res => res.status);

    if (!query.trim()) {
      // Need to check if we have a filter active. If we do, we'll want to
      // set the reservation state to all reservation that match that filter
      if (!filteredStatuses || filteredStatuses.length === 0) {
        reservation.setReservations(reservationCache);
      } else {
        reservation.setReservations(
          reservationCache.filter(({ status }) => {
            return filteredStatuses?.length === 0
              ? statuses.includes(status)
              : filteredStatuses?.includes(status);
          })
        );
      }
      return;
    }

    const filteredReservations = [...reservationCache].filter(
      reservation =>
        reservation.user.email.toLowerCase().includes(query.toLowerCase()) ||
        reservation.user.fullName.toLowerCase().includes(query.toLowerCase())
    );

    reservation.setReservations(filteredReservations);
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <LabeledInput
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        editable={!loader.isLoading}
        label="Search"
        returnKeyType="search"
        onSubmitEditing={event => searchStatus(event.nativeEvent.text.trim())}
        placeholder="Search for an email or name..."
        clearButtonMode="always"
        labelStyle={styles.searchInputLabel}
      />
      {(!item.available || item.quantity === 0) && (
        <Alert
          title="Cannot Create Reservation"
          message="You cannot create a reservation on an item that's unavailable."
          type="warning"
          style={styles.itemWarning}
        />
      )}
    </View>
  );

  const renderReservation = (reservation: Reservation) => (
    <ReservationListItem
      reservation={reservation}
      onPress={openStatusActionSheet}
      onDeleteStart={loader.startLoading}
      onDeleteFinish={loader.stopLoading}
    />
  );

  const onRefresh = async () => {
    if (!loader.isRefreshing && !loader.isLoading) {
      loader.startRefreshing();
      await loadReservations();
      loader.stopRefreshing();
    }
  };

  const init = async () => {
    loader.startLoading();
    await loadReservations();
    loader.stopLoading();
  };

  const scrollToTop = () =>
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: 0
    });

  useEffect(() => {
    init();

    return () => {
      // Resets the reservation state so that the previous item's reservations
      // don't render on the screen while the new reservations load
      reservation.setReservations([]);
    };
  }, []);

  // Navigating back to this screen from the Create Reservation screen won't cause the
  // useEffect hook above to trigger. That means the reservation cache will still hold
  // the old value. Because of this, we need to update the reservation cache, but only
  // if a reservation was added (hence the length check).
  useFocusEffect(
    useCallback(() => {
      if (reservation.reservations.length > reservationCache.length) {
        setReservationCache(reservation.reservations);
      }
    }, [reservation.reservations])
  );

  useEffect(() => {
    if (!filteredStatuses) {
      return;
    }

    scrollToTop();

    if (filteredStatuses.length === 0) {
      reservation.setReservations(reservationCache);
    } else {
      reservation.setReservations(
        reservationCache.filter(({ status }) => filteredStatuses.includes(status))
      );
    }
  }, [filteredStatuses]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} mode="margin">
      <StatusBar style="dark" />
      <BackTitleHeader title="Reservations" style={styles.header} />
      <Text style={styles.subHeader}>Tap on any reservation to update its status</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{
            flexGrow: 1,
            // Added a little padding to the bottom of the list so that the filter
            // and scroll to top buttons don't overlap the last reservation item.
            paddingBottom:
              loader.isLoading || reservation.reservations.length === 0 ? 0 : 132
          }}
          ListHeaderComponent={renderSearchBar()}
          ListEmptyComponent={<EmptyReservationList loading={loader.isLoading} />}
          data={reservation.reservations}
          renderItem={({ item }) => renderReservation(item)}
          keyExtractor={reservation => reservation.ID.toString()}
          refreshing={loader.isRefreshing}
          onRefresh={onRefresh}
        />
        {reservation.reservations.length > 0 && (
          <Button
            onPress={scrollToTop}
            style={styles.toTopButton}
            iconStyle={styles.buttonIcon}
            icon={<FontAwesome5 name="chevron-up" size={16} color="#FFF" />}
          />
        )}
        <Button
          disabled={loader.isLoading || loader.isRefreshing}
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
        disabled={!item.available || item.quantity === 0}
        onPress={() => navigation.navigate('CreateReservationScreen', { item })}
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
    paddingBottom: 24,
    lineHeight: 22,
    marginTop: -4
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
  },
  itemWarning: {
    marginTop: 16
  }
});

export default ReservationScreen;
