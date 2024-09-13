import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import SignInSignOutButton from './components/SignInSignOutButton';
import { AppAuthView } from './AppAuthView';
import { ApiView } from './ApiView';

function App() {

  useEffect(() => {
    // Handle deep links when the app is already running
    const handleDeepLink = (event) => {
      const { url } = event;
      Alert.alert('Deep Link URL', url);
    };
    Linking.addListener('url', handleDeepLink);
    // Subscribe to deep link events
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep links when the app is launched via a URL
    const getUrlAsync = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          Alert.alert('App Launched with URL', initialUrl);
        } else {
          Alert.alert('No Initial URL', 'The app was not launched with a deep link.');
        }
      } catch (err) {
        Alert.alert('Error Getting Initial URL', err.message);
      }
    };

    // Call the function to get the initial URL
    getUrlAsync();

    // Cleanup event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          {/*<SignInSignOutButton />*/}
        </View>
        <AppAuthView />
        <ApiView />
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
