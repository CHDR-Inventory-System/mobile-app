import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import { Colors, Fonts } from '../global-styles';

type AvatarProps = {
  text: string;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const Avatar = ({
  text,
  onPress,
  textStyle,
  style,
  size = 40
}: AvatarProps): JSX.Element => {
  const containerStyle: ViewStyle = {
    borderRadius: size / 2,
    width: size,
    height: size
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.container, containerStyle, style]}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors['monoChromatic-1'],
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.heading
  }
});

export default Avatar;
