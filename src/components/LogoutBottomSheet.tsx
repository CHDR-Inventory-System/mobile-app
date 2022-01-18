import React, { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../global-styles';
import Avatar from './Avatar';
import BottomSheet from '@gorhom/bottom-sheet';
import Button from './Button';
import { Portal } from '@gorhom/portal';
import { BottomSheetBackdropProps, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';

type LogoutBottomSheetProps = {
  onClose?: () => void;
};

const LogoutBottomSheet = ({ onClose }: LogoutBottomSheetProps): JSX.Element => {
  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  const navigation = useNavigation<NavigationProps>();

  return (
    <Portal>
      <BottomSheet
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        snapPoints={['25%']}
        backgroundStyle={styles.backgroundStyle}
        onClose={onClose}
      >
        <View style={styles.contentContainer}>
          <View style={styles.accountRow}>
            <Avatar text="JS" size={52} textStyle={styles.avatarText} />
            <View style={styles.textRow}>
              <Text style={styles.subtitleText}>Signed in as:</Text>
              <Text style={styles.emailText}>jsmith@ucf.edu</Text>
            </View>
          </View>
          <Button
            text="Log Out"
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between'
  },
  subtitleText: {
    marginBottom: 4,
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.subtitle,
    color: Colors.textMuted
  },
  emailText: {
    fontFamily: Fonts.text,
    fontSize: Fonts.defaultTextSize
  },
  avatarText: {
    fontSize: 20
  },
  accountRow: {
    flexDirection: 'row'
  },
  textRow: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'space-evenly'
  },
  backgroundStyle: {
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 16
  },
  logoutButton: {
    marginBottom: 16
  }
});

export default LogoutBottomSheet;
