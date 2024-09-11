import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View
} from 'react-native';
import {
  Colors,
  Header
} from 'react-native/Libraries/NewAppScreen';
import SignInSignOutButton from './components/SignInSignOutButton';
import { AppAuthView } from './AppAuthView';

function App() {

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
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <SignInSignOutButton />
          <AppAuthView />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
