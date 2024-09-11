//import { useState } from 'react';
//import { useMsal } from '@azure/msal-react';
import { loginRequest, msalConfig } from '../authConfig';
import { Button, View, Alert } from 'react-native';
import msal from '@azure/msal-browser';

export const SignInButton = () => {

    //const { instance } = useMsal();
    //const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    //const open = Boolean(anchorEl);

    const handleLogin = (loginType: string) => {
        //setAnchorEl(null);
        try {
            Alert.alert('loginType='+loginType);
            msal.createStandardPublicClientApplication(msalConfig).then((instance) => {
                if (loginType === 'popup') {
                    instance.loginPopup(loginRequest);
                } else if (loginType === 'redirect') {
                    Alert.alert('redirect 1');
                    instance.loginRedirect(loginRequest);
                    Alert.alert('redirect');
                }
            });
        } catch (e) {
            let s='';
            Object.entries(e as any).forEach(([key, value]) => {
                s+=','+(key + ": " + value);
            });
            Alert.alert('error='+s);
        }
    }

    return (
        <View>
            <Button
                title='Sign in using Popup'
                onPress={() => handleLogin('popup')}
            />
            <Button
                title='Sign in using Redirect'
                onPress={() => handleLogin('redirect')}
            />
            {/*
            <Button
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color='inherit'
            >
                Login
            </Button>
            <Menu
                id='menu-appbar'
                anchorEl={anchorEl}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => handleLogin('popup')} key='loginPopup'>Sign in using Popup</MenuItem>
                <MenuItem onClick={() => handleLogin('redirect')} key='loginRedirect'>Sign in using Redirect</MenuItem>
            </Menu>*/}
        </View>
    )
};