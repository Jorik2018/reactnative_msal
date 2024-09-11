import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CLIENT_ID, REDIRECT_URL, MSAL_TENANT } from 'react-native-config';
import { Alert, Linking, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Button,
  ButtonContainer,
  Form,
  FormLabel,
  FormValue,
  Heading,
} from './components';
import axios from 'axios';
import { generateClientRequestId, generateCodeChallenge, generateRandomString, generateState } from './utils';

const configs: {
  [key: string]: any
} = {
  auth0: {
    issuer: 'https://telefonicaperuscrtyb2bdev.b2clogin.com/telefonicaperuscrtyb2bdev.onmicrosoft.com/B2C_1_signupsignin1/v2.0',
    clientId: '381a63ba-e125-40d1-810f-30ebbd0f47f0',
    redirectUrl: 'msauth://pe.telefonica.ionicmsal/1wIqXSqBj7w%2Bh11ZifsnqwgyKrY%3D',
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
  accessTokenExpirationDate: '',
  refreshToken: '',
  scopes: []
};

export const ApiView = () => {
  const [authState, setAuthState] = useState(defaultAuthState);
  useEffect(() => {

  }, []);

  const handleAuthorize = useCallback(async () => {
    axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then((response) => {
        const { authorization_endpoint } = response.data;
        Alert.alert('Authorization Endpoint', authorization_endpoint);
        const codeVerifier = generateRandomString(43);
        AsyncStorage.setItem('pkce_code_verifier', codeVerifier).then(() => {
          generateCodeChallenge(codeVerifier).then(code_challenge => {
            const state = generateState();
            AsyncStorage.setItem('pkce_state', state).then(() => {
              const params = new URLSearchParams({
                client_id: CLIENT_ID,
                scope: 'openid',
                'redirect_uri': REDIRECT_URL,
                'client-request-id': generateClientRequestId(),
                response_mode: 'fragment',
                response_type: 'code',
                client_info: '1',
                state,
                nonce: generateRandomString(16), // 16-character nonce
                code_challenge,
                code_challenge_method: 'S256'
              }).toString();
              Linking.openURL(`${authorization_endpoint}?${params}`);
            });
          });
        });
      }).catch((error) => {
        console.error('Error fetching authorization endpoint:', error);
        Alert.alert('Error', 'Failed to fetch the authorization endpoint.');
      });
  }, []);

  const handleRefresh = useCallback(async () => {
    /*try {
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
    }*/
  }, [authState]);

  const handleRevoke = useCallback(async () => {
    /*try {
      const config = configs[authState.provider];
      await revoke(config, {
        tokenToRevoke: authState.accessToken,
        sendClientId: true,
      });

      setAuthState({
        provider: '',
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: '',
        hasLoggedInOnce: false,
        scopes: []
      });
    } catch (error: { message: string }) {
      Alert.alert('Failed to revoke token', error.message);
    }*/
  }, [authState]);

  const showRevoke = useMemo(() => {
    if (authState.accessToken) {
      const config = configs[authState.provider];
      if (config.issuer || config.serviceConfiguration.revocationEndpoint) {
        return true;
      }
    }
    return false;
  }, [authState]);

  return (
    <View>
      {authState.accessToken ? (
        <Form>
          <FormLabel>accessToken</FormLabel>
          <FormValue>{authState.accessToken}</FormValue>
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
        {!authState.accessToken ? (
          <Button
            onPress={() => handleAuthorize()}
            text="Authorize API"
            color="#DA2536"
          />
        ) : null}
        {authState.refreshToken ? (
          <Button onPress={handleRefresh} text="Refresh" color="#24C2CB" />
        ) : null}
        {showRevoke ? (
          <Button onPress={handleRevoke} text="Revoke" color="#EF525B" />
        ) : null}
      </ButtonContainer>
    </View>
  );
};