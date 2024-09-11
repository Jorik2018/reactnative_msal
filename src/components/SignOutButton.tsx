//import { useMsal } from '@azure/msal-react';
//import IconButton from '@mui/material/IconButton';
//import AccountCircle from '@mui/icons-material/AccountCircle';
//import MenuItem from '@mui/material/MenuItem';
//import Menu from '@mui/material/Menu';
import { Button, View } from 'react-native';
import msal from '@azure/msal-browser';
import { msalConfig } from '../authConfig';

export const SignOutButton = () => {
    //const { instance } = useMsal();

    //const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    //const open = Boolean(anchorEl);

    const handleLogout = (logoutType: string) => {
        //setAnchorEl(null);
        msal.createStandardPublicClientApplication(msalConfig).then((instance) => {
            if (logoutType === 'popup') {
                instance.logoutPopup({
                    mainWindowRedirectUri: '/'
                });
            } else if (logoutType === 'redirect') {
                instance.logoutRedirect();
            }
        });
    }

    return (
        <View>
            {/*<IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color='inherit'
            >
                <AccountCircle />
            </IconButton>
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
                <MenuItem onClick={() => handleLogout('popup')} key='logoutPopup'>Logout using Popup</MenuItem>
                <MenuItem onClick={() => handleLogout('redirect')} key='logoutRedirect'>Logout using Redirect</MenuItem>
            </Menu>
            */}
            <Button
                title='Logout using Popup'
                onPress={() => handleLogout('popup')}
            />
            <Button
                title='Logout using Redirect'
                onPress={() => handleLogout('redirect')}
            />
        </View>
    )
};