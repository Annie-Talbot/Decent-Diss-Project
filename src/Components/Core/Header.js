import React from "react";
import Logout from '../Login/Logout';
import { Title, Group, Center } from '@mantine/core';
import { Logo } from "./Constants/Logo";

/**
 * A component that groups all items that should be included 
 * the in application header. Takes the App component as a 
 * prop so that its state can determine the appearence of 
 * some attributes.
 */
class AppHeader extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app
    }

    render() {
        return (
            <Group sx={{ height: '100%' }} px={20} position="apart">
                <Logo />
                <Title order={1}>{this.app.state.currPage}</Title>
                <Center style={{ width: 80}}>
                {this.app.state.loggedIn ? <Logout app={this.app} />: <div></div>}
                </Center>
            </Group>
        );
    }
}

export default AppHeader;