import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  TextProps,
  StyleProp,
  TextStyle,
} from 'react-native';

type CustomTextProps = TextProps & {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

export default function Text({
  style,
  children,
  ...props
}: CustomTextProps): React.JSX.Element {
  return (
    <RNText style={[styles.defaultFont, style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'Merriweather',
  },
});