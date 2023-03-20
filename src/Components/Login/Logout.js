import React from 'react';
import { Button } from '@mantine/core';
import { logoutHandler } from '../../SOLID/LoginHandler';

/**
 * A React Class component.
 */
export function LogoutButton(props) {
    let handleLogout = async function () {
        await logoutHandler();
        props.logout();
    }
    return (
        <Button onClick={() => handleLogout()}>Logout</Button>
    );
}