import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../global-styles';
import { platformValue } from '../util/platform';
import Avatar from './Avatar';
import LogoutBottomSheet from './LogoutBottomSheet';

const Navbar = (): JSX.Element => {
  const [isSheetShowing, setSheetShowing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>CHDR</Text>
          <Text style={styles.subTitle}>Admin</Text>
        </View>
        <Avatar text="JS" onPress={() => setSheetShowing(true)} />
        {isSheetShowing && <LogoutBottomSheet onClose={() => setSheetShowing(false)} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    backgroundColor: Colors.appBackgroundColor
  },
  content: {
    height: 80,
    marginTop: platformValue(24, 40),
    paddingLeft: 24,
    paddingRight: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.heading,
    fontSize: 32
  },
  subTitle: {
    alignSelf: 'center',
    marginLeft: 12,
    color: Colors.textMuted,
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.subtitle
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'row'
  }
});

export default Navbar;
