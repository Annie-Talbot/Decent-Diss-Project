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
            <Grid justify="space-between" align="flex-end" sx={{ height: '100%' }} px={20}>
                <Grid.Col span={2}>
                    <Group position="left">
                        <Logo />
                    </Group>
                
                </Grid.Col>
                <Grid.Col span={3}>
                    <Center style={{ width: 320}} >
                        <ShareButton webId={props.user.webId}/>
                        <Space w="md"/>
                        {/* {props.user.loggedIn !== false && props.user.podRootDir !== '' && 
                            <Notifications podRootDir={props.user.podRootDir}/>
                        } */}
                        <Space w="md"/>
                        {props.user.loggedIn && <LogoutButton logout={props.logout} />}
                    </Center>
                </Grid.Col>
            </Grid>
        </Header>
    );
}

export default AppHeader;