import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LoadingOverlay from '../Loading';
import { Colors, Fonts } from '../../global-styles';

type EmptyReservationListProps = {
  /**
   * If set to true, this will hide the content of the component
   * but the component will still fill the screen. This is so that
   * the Reservation screen doesn't show a 'No reservations' component while it's
   * loading reservations.
   */
  loading: boolean;
};

const EmptyReservationList = ({ loading }: EmptyReservationListProps): JSX.Element => {
  return (
    <View style={styles.emptyContentContainer}>
      {loading ? (
        <LoadingOverlay
          text="Loading..."
          loading={loading}
          backdropStyle={styles.loaderBackdrop}
          textStyle={styles.loaderText}
          activityIndicatorColor={Colors.textMuted}
        />
      ) : (
        <>
          <FontAwesome
            name="calendar-times-o"
            size={100}
            color="black"
            style={styles.calendarIcon}
          />
          <Text style={styles.emptyTextTitle}>No reservations to show</Text>
          <Text style={styles.emptyTextDescription}>Create a reservation to get started</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContentContainer: {
    flexGrow: 1,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 120,
    alignItems: 'center'
  },
  emptyTextTitle: {
    fontSize: 24,
    color: Colors.text,
    fontFamily: Fonts.heading,
    marginBottom: 16
  },
  emptyTextDescription: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize
  },
  calendarIcon: {
    marginBottom: 32,
    alignSelf: 'center',
    color: Colors.text
  },
  loaderBackdrop: {
    backgroundColor: Colors.appBackgroundColor
  },
  loaderText: {
    color: Colors.textMuted
  }
});

export default EmptyReservationList;
