import axios from "axios";
//import QuickCrypto from 'react-native-quick-crypto';

export const generateCodeVerifier = (length: number = 43): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        codeVerifier += charset[randomIndex];
    }
    return codeVerifier;
};

export const generateCodeChallenge = (codeVerifier: string) => {
    return axios.post('https://grupoipeys.com/wp-json/api/crypto/code-challenge', codeVerifier, {
        headers: {
          'Content-Type': 'text/plain',
        },
      }).then((response)=>{
        return response.data;
      });
    /*const hashedBuffer = QuickCrypto.createHash('sha256')
        .update(codeVerifier)
        .digest('hex');
    const base64String = Buffer.from(hashedBuffer, 'hex').toString('base64');
    const codeChallenge = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return Promise.resolve(codeChallenge);*/
    // return crypto.subtle.digest('SHA-256', data).then((hashedBuffer) => {
    /*Alert.alert('1111', 'base64String');
    const hashArray = Array.from(new Uint8Array(hashedBuffer));
    const base64String = btoa(String.fromCharCode.apply(null, hashArray));
    Alert.alert('base64String', base64String);
    return Promise.resolve(base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));*/
    //});
};

export const generateRandomString = (length: number = 32): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset[randomIndex];
    }
    return randomString;
};

export const generateState = (): string => {
    const stateObject = {
        id: generateRandomString(16),
        meta: {
            interactionType: "redirect"
        }
    };
    const stateString = JSON.stringify(stateObject);

    // Base64 encode the JSON string and make it URL-safe
    const base64State = btoa(stateString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return base64State;
};

export const generateClientRequestId = (): string => {
    // Generates a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
