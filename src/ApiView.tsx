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
    issuer: `https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/B2C_1_signupsignin1/v2.0`,
    clientId: CLIENT_ID,
    redirectUrl: REDIRECT_URL,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
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

  const getUserProfile = useCallback((accessToken: string) => {
    axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => {
      Alert.alert('Error', JSON.stringify(data));
    }).catch((error) => {
      Alert.alert('Error', JSON.stringify(error ? { status: error.status, error: error.error.error } : 'ERROR'));
    });
  }, []);

  const getToken = useCallback(async (code: string) => {
    return axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then(({ data }) => {
        const tokenEndpoint = data.token_endpoint;
        return AsyncStorage.getItem('pkce_code_verifier')
          .then(pkceCodeVerifier => {
            const body = new URLSearchParams();
            body.append('client_id', CLIENT_ID);
            body.append('redirect_uri', REDIRECT_URL);
            body.append('scope', 'openid profile offline_access');
            body.append('code', code);
            body.append('code_verifier', pkceCodeVerifier || ''); // Ensure code_verifier is set
            body.append('grant_type', 'authorization_code');
            const headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
            };
            return axios.post(tokenEndpoint, body.toString(), { headers });
          });
      }).then(tokenResponse => tokenResponse.data).catch(error => {
        console.error('Error fetching token:', error);
        throw error;
      });
  }, []);

  const handleDeepLink = useCallback(async ({ url }: { url?: string }) => {
    AsyncStorage.getItem('pkce_state').then(async (state) => {
      if (state) {
        try {
          if (url) {
            const parsedUrl = new URL(url);
            const searchParams = new URLSearchParams(parsedUrl.search);
            const queryParams = {
              code: searchParams.get('code'),
              state: searchParams.get('state'),
              error: searchParams.get('error'),
            };
            if (!queryParams.code || !queryParams.state) {
              const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
              queryParams.code = hashParams.get('code');
              queryParams.state = hashParams.get('state');
              queryParams.error = hashParams.get('error');
            }
            if (queryParams.code) {
              await AsyncStorage.setItem('pkce_code', queryParams.code);
            }
          }
          AsyncStorage.getItem('pkce_code').then((code) => {
            if (code) {
              getToken(code).then((tokenResponse) => {
                if (tokenResponse) {
                  if (tokenResponse.accessToken) {
                    getUserProfile(tokenResponse.accessToken);
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error('Error handling deep link:', error);
          Alert.alert('Error', 'An error occurred while processing the deep link.');
        }
      }
    });
  }, [getToken, getUserProfile]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    handleDeepLink({});
    return () => subscription.remove();

  }, [handleDeepLink]);

  const [authState, setAuthState] = useState(defaultAuthState);

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
    axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then(({ data }) => {
        Alert.alert('Error', JSON.stringify(data));
      });
  }, []);

  const handleRevoke = useCallback(async () => {
    axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then(({ data }) => {
        Alert.alert('Error', JSON.stringify(data));
      });
  }, []);

  const showRevoke = useMemo(() => {
    if (authState.accessToken) {
      return true;
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