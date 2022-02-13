import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { View, TouchableOpacity, Text } from 'react-native';
import { Reservation, ReservationStatus } from '../../types/API';
import moment from 'moment';
import { Fonts } from '../../global-styles';
import useReservations from '../../hooks/reservation';
import * as Haptics from 'expo-haptics';
import useLoader from '../../hooks/loading';

type ReservationListItemProps = {
  reservation: Reservation;
  onPress: (reservation: Reservation) => void;
  onDeleteStart: () => void;
  onDeleteFinish: () => void;
};

const statusColorMap: Record<ReservationStatus, string> = {
  Approved: '#5EE010',
  'Checked Out': '#3F791C',
  Denied: '#EB826B',
  Late: '#F1DE32',
  Missed: '#FF2E00',
  Pending: '#C8C8C8',
  Returned: '#5452F6'
};

const ReservationListItem = ({
  reservation,
  onPress,
  onDeleteStart,
  onDeleteFinish
}: ReservationListItemProps): JSX.Element => {
  const { deleteReservation } = useReservations();
  const loader = useLoader();

  const onDelete = async () => {
    onDeleteStart();

    try {
      await loader.sleep(2000);
      await deleteReservation(reservation.ID);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(
        'Unexpected Error',
        'An error occurred trying to delete this reservation.',
        [
          {
            text: 'Retry',
            onPress: onDelete
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }

    onDeleteFinish();
  };

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      'Delete Reservation',
      'Are you sure you want to delete this reservation?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.reservationRowContainer}
      activeOpacity={0.6}
      onPress={() => onPress(reservation)}
      onLongPress={confirmDelete}
    >
      <View
        style={{
          ...styles.reservationStatusBar,
          backgroundColor: statusColorMap[reservation.status]
        }}
      />
      <View style={{ paddingVertical: 16 }}>
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
};

const borderRadius = 4;

const styles = StyleSheet.create({
  reservationRowContainer: {
    marginVertical: 16,
    flexDirection: 'row',
    marginHorizontal: 8,
    borderRadius: borderRadius,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 2
  },
  reservationStatusBar: {
    width: 8,
    height: '100%',
    marginRight: 8,
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius
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
  }
});

export default ReservationListItem;
