import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export default function Text({ style, children, ...props }) {
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