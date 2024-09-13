import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CLIENT_ID, REDIRECT_URL, MSAL_TENANT } from './config';
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

  const handleDeepLink = useCallback(async (result: { url?: string }) => {
    const url = result.url;
    if (url) {
      Alert.alert('URL', url);
    }
    AsyncStorage.getItem('pkce_state').then(async (state) => {
      if (state) {
        Alert.alert('URL', 'STATE=' + state + ' ' + url + '-' + JSON.stringify((await AsyncStorage.getAllKeys())));
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
            //Alert.alert('Error', 'code=' + code);
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
    // Check if the app was launched via a deep link
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          Alert.alert('getInitialURL', url);
          //handleDeepLink({ url });
        }
      })
      .catch((err) => console.error('An error occurred', err));
    return () => subscription.remove();
  }, [handleDeepLink]);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          Alert.alert('getInitialURL2', url);
          //handleDeepLink({ url });
        }
      })
      .catch((err) => {
        Alert.alert('getInitialURL2', '22'+err);
      });
  }, []);

  const [authState, setAuthState] = useState(defaultAuthState);

  const handleAuthorize = useCallback(async () => {
    axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then((response) => {
        const { authorization_endpoint } = response.data;
        const codeVerifier = generateRandomString(43);
        AsyncStorage.setItem('pkce_code_verifier', codeVerifier).then(() =>
          generateCodeChallenge(codeVerifier).then(code_challenge => {
            const state = generateState();
            AsyncStorage.setItem('pkce_state', state).then(() => {
              const client_request_id = generateClientRequestId();
              AsyncStorage.setItem('client_request_id', client_request_id).then(() => {
                const params = new URLSearchParams({
                  client_id: CLIENT_ID,
                  scope: 'openid',
                  'redirect_uri': REDIRECT_URL,
                  'client-request-id': client_request_id,
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
          })
        );
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

  const handleRevoke = useCallback(() => {
    axios.get(`https://${MSAL_TENANT}.b2clogin.com/${MSAL_TENANT}.onmicrosoft.com/b2c_1_signupsignin1/v2.0/.well-known/openid-configuration`)
      .then((response) => {
        const { end_session_endpoint } = response.data;
        AsyncStorage.getItem('client-request-id').then((client_request_id) => {
          const params = new URLSearchParams({
            'post_logout_redirect_uri': REDIRECT_URL,
            'client-request-id': client_request_id || ''
          }).toString();
          Linking.openURL(`${end_session_endpoint}?${params}`);
        });
      });
  }, []);

  const showRevoke = useMemo(() => {
    if (authState.accessToken || authState.refreshToken) {
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
          <Button onPress={handleRevoke} text="Logout" color="#EF525B" />
        ) : null}
      </ButtonContainer>
    </View>
  );
};