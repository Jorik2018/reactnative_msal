import React,{ReactNode} from 'react';
import { StyleSheet, SafeAreaView} from 'react-native';

interface Props {
    children: ReactNode;
}

const Page = ({children}:Props) => (
    <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    paddingHorizontal: 10,
    paddingBottom: 10,
    width: '100%',
    height: '100%',
  },
  safe: {
    flex: 1,
  },
});

export default Page;