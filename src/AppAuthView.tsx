import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CLIENT_ID, REDIRECT_URL, MSAL_TENANT } from './config';
import { Alert, View } from 'react-native';
import {
  authorize,
  refresh,
  revoke,
  prefetchConfiguration,
} from 'react-native-app-auth';
import {
  Button,
  ButtonContainer,
  Form,
  FormLabel,
  FormValue,
  Heading,
} from './components';

const configs: {
  [key: string]: any
} = {
  auth0: {
    issuer: `https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/B2C_1_signupsignin1/v2.0`,
    clientId: CLIENT_ID,
    redirectUrl: REDIRECT_URL,
    scopes: ['openid', 'profile', 'email', 'offline_access'],

    // serviceConfiguration: {
    //   authorizationEndpoint: 'https://samples.auth0.com/authorize',
    //   tokenEndpoint: 'https://samples.auth0.com/oauth/token',
    //   revocationEndpoint: 'https://samples.auth0.com/oauth/revoke'
    // }
  },
};

const defaultAuthState = {
  hasLoggedInOnce: false,
  provider: '',
  accessToken: '',
  idToken: '',
  accessTokenExpirationDate: '',
  refreshToken: '',
  scopes: []
};

export const AppAuthView = () => {

  const [authState, setAuthState] = useState(defaultAuthState);

  useEffect(() => {
    prefetchConfiguration({
      warmAndPrefetchChrome: true,
      connectionTimeoutSeconds: 5,
      ...configs.auth0,
    });
  }, []);

  const handleAuthorize = useCallback(async (provider: string) => {
    try {
      const config = configs[provider];
      const newAuthState = await authorize({
        ...config,
        connectionTimeoutSeconds: 5,
        iosPrefersEphemeralSession: true,
      });
      Alert.alert('newAuthState=', JSON.stringify(newAuthState));
      setAuthState({
        hasLoggedInOnce: true,
        provider: provider,
        ...newAuthState,
      } as any);
    } catch (error: { message: string }) {
      Alert.alert('Failed to log in', error.message);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      const config = configs[authState.provider];
      const newAuthState = await refresh(config, {
        refreshToken: authState.refreshToken,
      });

      setAuthState(current => ({
        ...current,
        ...newAuthState,
        refreshToken: newAuthState.refreshToken || current.refreshToken,
      }));
    } catch (error: { message: string }) {
      Alert.alert('Failed to refresh token', error.message);
    }
  }, [authState]);

  const handleRevoke = useCallback(async () => {
    try {
      const config = configs[authState.provider];
      await revoke(config, {
        tokenToRevoke: authState.accessToken || authState.refreshToken,
        sendClientId: true,
      });

      setAuthState({
        provider: '',
        idToken: '',
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: '',
        hasLoggedInOnce: false,
        scopes: []
      });
    } catch (error: { message: string }) {
      Alert.alert('Failed to revoke token', error.message);
    }
  }, [authState]);

  const showRevoke = useMemo(() => {
    if (authState.accessToken || authState.refreshToken) {
      const config = configs[authState.provider];
      if (config.issuer || config.serviceConfiguration.revocationEndpoint) {
        return true;
      }
    }
    return false;
  }, [authState]);

  return (
    <View>
      {authState.accessToken || authState.refreshToken ? (
        <Form>
          <FormLabel>accessToken</FormLabel>
          <FormValue>{authState.accessToken}</FormValue>
          <FormLabel>idToken</FormLabel>
          <FormValue>{authState.idToken}</FormValue>
          <FormLabel>accessTokenExpirationDate</FormLabel>
          <FormValue>{authState.accessTokenExpirationDate}</FormValue>
          <FormLabel>refreshToken</FormLabel>
          <FormValue>{authState.refreshToken}</FormValue>
          <FormLabel>scopes</FormLabel>
          <FormValue>{authState.scopes.join(', ')}</FormValue>
        </Form>
      ) : (
        <Heading>
          {authState.hasLoggedInOnce ? 'Goodbye.' : 'Hello, stranger.'}
        </Heading>
      )}

      <ButtonContainer>
        {!(authState.accessToken || authState.refreshToken) ? (
          <>
            <Button
              onPress={() => handleAuthorize('auth0')}
              text="Authorize"
              color="#DA2536"
            />
          </>
        ) : null}
        {authState.refreshToken ? (
          <Button onPress={handleRefresh} text="Refresh" color="#24C2CB" />
        ) : null}
        {showRevoke ? (
          <>
          <Button onPress={handleRevoke} text="Revoke" color="#EF525B" />
          <Button onPress={handleRevoke} text="Logout API" color="#EF525B" />
          </>
        ) : null}
        
      </ButtonContainer>
    </View>
  );
};