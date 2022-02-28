import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '../../global-styles';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { ReservationStatus } from '../../types/API';

type StatusBottomSheetProps = {
  onClose: (selectedStatuses: ReservationStatus[]) => void;
  selectedStatuses: ReservationStatus[];
};

const statuses: ReservationStatus[] = [
  'Approved',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

const StatusBottomSheet = ({
  onClose,
  selectedStatuses
}: StatusBottomSheetProps): JSX.Element => {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );
  const [selected, setSelected] = useState(selectedStatuses);

  const updateStatuses = (checked: boolean, status: ReservationStatus) => {
    let newStatuses = [...selected];

    if (checked) {
      newStatuses.push(status);
    } else {
      newStatuses = newStatuses.filter(s => status !== s);
    }

    setSelected(newStatuses);
  };

  const renderStatusRow = (status: ReservationStatus) => (
    <View key={status} style={styles.statusRow}>
      <BouncyCheckbox
        size={32}
        isChecked={selectedStatuses.includes(status)}
        fillColor={Colors['monoChromatic-3']}
        onPress={checked => updateStatuses(checked, status)}
      />
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );

  return (
    <Portal>
      <BottomSheet
        enablePanDownToClose
        snapPoints={['60%', '90%']}
        onClose={() => onClose(selected)}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.heading}>Filter</Text>
          <Text style={styles.subHeading}>Filter reservations by status</Text>
          {statuses.map(renderStatusRow)}
        </View>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 16,
    paddingHorizontal: 16
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.text
  },
  subHeading: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    marginTop: 10,
    fontSize: Fonts.defaultTextSize,
    marginBottom: 16
  },
  statusRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center'
  },
  statusText: {
    fontFamily: Fonts.text,
    color: Colors.text,
    fontSize: Fonts.defaultTextSize
  }
});

export default StatusBottomSheet;
