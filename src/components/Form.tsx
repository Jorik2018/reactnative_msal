import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
    children: ReactNode;
}

const Form = (props: Props) => <View style={styles.form} {...props} />;

const styles = StyleSheet.create({
    form: {
        flex: 1
    },
});

export default Form;