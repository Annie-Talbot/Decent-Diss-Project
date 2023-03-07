import React from "react";
import Logout from '../Login/Logout';
import { Title, Group, Center, Space } from '@mantine/core';
import { Logo } from "./Constants/Logo";
import { Notifications } from "../Notifications/Notifications";

/**
 * A component that groups all items that should be included 
 * the in application header. Takes the App component as a 
 * prop so that its state can determine the appearence of 
 * some attributes.
 */
export function AppHeader(props) {
    return (
        <Group sx={{ height: '100%' }} px={20} position="apart">
            <Logo />
            <Title order={1}>{props.app.state.currPage}</Title>
            <Center style={{ width: 170}}>
                {props.app.state.loggedIn !== false && props.app.podRootDir !== '' && 
                    <Notifications podRootDir={props.app.podRootDir}/>
                }
                <Space w="md"/>
                {props.app.state.loggedIn && <Logout app={props.app} />}
            </Center>
        </Group>
    );
}

export default AppHeader;