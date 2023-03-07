import React from 'react';
import { logout } from '@inrupt/solid-client-authn-browser';
import { Button } from '@mantine/core';
import { AppStates } from '../Core/Constants/AppStates';

/**
 * A React Class component.
 */
class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;
    }

    async handleLogout(app) {
        await logout();
        console.log("Logged out");
        this.podRootDir = '';
        this.webId = '';
        this.notificationSocket = null;
        app.setState(prevState => (
            {...prevState, 
            currPage: AppStates.LogIn, 
            loggedIn: false
        }));
    }

    render() {
        return (
            <Button onClick={() => this.handleLogout(this.app)}>Logout</Button>
        );
    }
}

export default Logout;