import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';

const font = Platform.select({
  ios: 'GillSans-light',
  android: 'sans-serif-thin'
});

interface HeadingProps {
    children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ children }) => (
    <Text style={[styles.text, { fontFamily: font }]}>
      {children}
    </Text>
  );

const styles = StyleSheet.create({
  text: {
    color: 'black',
    fontSize: 32,
    marginTop: 120,
    backgroundColor: 'transparent',
    textAlign: 'center',
  }
});

export default Heading;