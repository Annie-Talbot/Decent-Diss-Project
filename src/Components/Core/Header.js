import React from "react";
import { LogoutButton } from '../Login/Logout';
import { Group, Center, Space, Grid, Header } from '@mantine/core';
import { Logo } from "./Constants/Logo";
import { Notifications } from "../Notifications/Notifications";
import { ShareButton } from "./ShareButton";

/**
 * A component that groups all items that should be included 
 * the in application header. Takes the App component as a 
 * prop so that its state can determine the appearence of 
 * some attributes.
 */
export function AppHeader(props) {
    return (
        <Header height={60} p="xs">
            <Group position="apart" align="flex-end">
                <Logo />
                <Group spacing='2px'>
                    <ShareButton webId={props.user.webId}/>
                    <Space w="md"/>
                    {props.user.loggedIn && props.user.podRootDir && 
                        <Notifications user={props.user}/>
                    }
                    <Space w="md"/>
                    {props.user.loggedIn && <LogoutButton logout={props.logout} />}
                </Group>
            </Group>
        </Header>
    );
}

export default AppHeader;