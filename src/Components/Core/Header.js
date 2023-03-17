import React from "react";
import Logout from '../Login/Logout';
import { Title, Group, Center, Space, Text, Button, Grid } from '@mantine/core';
import { Logo } from "./Constants/Logo";
import { Notifications } from "../Notifications/Notifications";
import { AppStates } from "./Constants/AppStates";
import { ShareButton } from "./ShareButton";

/**
 * A component that groups all items that should be included 
 * the in application header. Takes the App component as a 
 * prop so that its state can determine the appearence of 
 * some attributes.
 */
export function AppHeader(props) {

    return (
        <Grid justify="space-between" align="flex-end" sx={{ height: '100%' }} px={20}>
            {props.app.state.currPage == AppStates.LogIn? 
                <Grid.Col span={12}>
                    <Center>
                        <Logo />
                    </Center>
                </Grid.Col>
            :
            <>
            <Grid.Col span={2}>
                <Group position="left">
                    <Logo />
                </Group>
               
            </Grid.Col>
            <Grid.Col span={4}>
                <Center>
                    <Title order={1}>{props.app.state.currPage}</Title>
                </Center>
            </Grid.Col>
            <Grid.Col span={3}>
                <Center style={{ width: 320}} >
                    <ShareButton webId={props.app.webId}/>
                    <Space w="md"/>
                    {props.app.state.loggedIn !== false && props.app.podRootDir !== '' && 
                        <Notifications podRootDir={props.app.podRootDir}/>
                    }
                    <Space w="md"/>
                    {props.app.state.loggedIn && <Logout app={props.app} />}
                </Center>
            </Grid.Col>
            </>
            }
        </Grid>
    );
}

export default AppHeader;