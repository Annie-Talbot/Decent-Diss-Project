import React from 'react';
import { Navbar, ThemeIcon, UnstyledButton, Group, Text } from '@mantine/core';
import { IconUser, IconHome, IconAffiliate, IconFlipFlops } from '@tabler/icons';
import { AppStates } from './Constants/AppStates';

/**
 * The information to be displayed in the side bar incl. the state they should set the app to.
 */
const data = [
    { 
        icon: <IconHome size={16} />, 
        color: 'blue', 
        label: 'Posts', 
        state:AppStates.Posts 
    },
    { 
        icon: <IconUser size={16} />, 
        color: 'teal', 
        label: 'Profile', 
        state: AppStates.Profile 
    },
    { 
        icon: <IconAffiliate size={16} />, 
        color: 'violet', 
        label: 'Connections',
        state:AppStates.Connections 
    },
    { 
        icon: <IconFlipFlops size={16} />, 
        color: 'pink', 
        label: 'Notifications', 
        state: AppStates.Notifications 
    },
];

/**
 * 
 * @param {dict} {icon, label, color, state} The dictionary holding all 
 * data required for the button to be created  
 * @param {App} app The main app object that controls the state of the 
 * display.
 * @returns The Component to be placed into the Sidebar.
 */
function SideBarItem({icon, label, color, state}, app) {
    return (
        <UnstyledButton
            sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    
            '&:hover': {
                backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            },
            })}
            key={label}
            onClick={() => {
                if (app.state.loggedIn !== false) {
                    app.setState(prevState => (
                        {...prevState, 
                        currPage: state,
                    }))
                }
            }}
        >
            <Group>
            <ThemeIcon color={color} variant="light">
                {icon}
            </ThemeIcon>
    
            <Text size="sm">{label}</Text>
            </Group>
        </UnstyledButton>
    );
}

/**
 * An extention of the Mantine Navbar Component to allow for an additional prop.
 */
function SideBar(props) {
    return (
        <Navbar height={600} p="xs" width={{ base: 300 }}>
            {data.map((item) => (
                <Navbar.Section mt="md">{SideBarItem(item, props.app)}</Navbar.Section>
            ))}
        </Navbar>
    );
}

export default SideBar;