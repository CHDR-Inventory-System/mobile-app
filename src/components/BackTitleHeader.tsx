import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { platformValue } from '../util/platform';
import { Fonts } from '../global-styles';

type BackTitleHeaderProps = {
  title: string;
  titleStyle?: TextStyle
  style?: ViewStyle;
  onBackPress?: () => void;
};

/**
 * A utility component that displays a back arrow with a
 * title to the right of it. Pressing back (by default), will
 * take the user to the previous screen
 */
const BackTitleHeader = ({
  title,
  onBackPress,
  titleStyle,
  style
}: BackTitleHeaderProps): JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity activeOpacity={1} onPress={handleBackPress}>
        <AntDesign name="arrowleft" size={32} color="black" style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.itemNameContainer}>
        <Text style={[styles.itemName, titleStyle]}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row'
  },
  icon: {
    marginRight: 16
  },
  itemNameContainer: {
    // Necessary because of a bug in React Native
    // https://stackoverflow.com/a/47254969/9124220
    // https://github.com/facebook/react-native/issues/1438
    width: 0,
    flexGrow: 1,
    flex: 1
  },
  itemName: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    lineHeight: 30,
    flexShrink: 1,
    marginTop: platformValue(0, 4)
  }
});

export default BackTitleHeader;
