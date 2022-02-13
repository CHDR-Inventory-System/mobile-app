import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors, Fonts } from '../../global-styles';

const EmptyReservationList = (): JSX.Element => (
  <View style={styles.emptyContentContainer}>
    <FontAwesome
      name="calendar-times-o"
      size={100}
      color="black"
      style={styles.calendarIcon}
    />
    <Text style={styles.emptyTextTitle}>No reservations to show</Text>
    <Text style={styles.emptyTextDescription}>Create a reservation to get started</Text>
  </View>
);

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
  }
});

export default EmptyReservationList;
