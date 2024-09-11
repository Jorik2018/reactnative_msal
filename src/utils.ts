export const generateCodeVerifier = (length: number = 43): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        codeVerifier += charset[randomIndex];
    }
    return codeVerifier;
};

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    // Hash the codeVerifier using SHA-256
    const hashedBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hashed buffer to a base64 string
    const hashArray = Array.from(new Uint8Array(hashedBuffer));
    const base64String = btoa(String.fromCharCode.apply(null, hashArray));

    // Convert base64 to base64-url format (remove padding, replace + with -, replace / with _)
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
