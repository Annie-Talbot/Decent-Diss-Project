import React, { useState } from 'react';
import { ActionIcon, Text, Center, Group, Paper, Title, Divider} from '@mantine/core';
import { Profile } from './Profile';
import { IconArrowBack } from '@tabler/icons';
import { createSampleProfile, doesProfileExist } from '../../SOLID/ProfileHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconEdit } from '@tabler/icons-react';


export function ProfilePage(props) {
    const [editing, setEditing] = useState(false);

        return (
            <Center>
            <Paper p="sm" shadow="xs" style={{minWidth: 800}}>
                <PageLoader
                    checkFunction={doesProfileExist}
                    createFunction={createSampleProfile}
                    podRootDir={props.user.podRootDir}
                    podStructureRequired="profile"
                >
                    <Group position='apart' align='flex-end'
                        style={{
                            height: "24px", 
                            marginBottom: "20px", 
                            paddingRight: 20,
                            paddingLeft: 20,
                        }}
                    >  
                        <Group spacing='md'>
                            <ActionIcon
                                size='lg'
                                disabled={!editing}
                                onClick={() => setEditing(false)}
                            >
                                <IconArrowBack />
                            </ActionIcon>
                            <Title>Your Profile</Title>
                        </Group>
                        {!editing ?
                            <ActionIcon
                                size="lg"
                                variant="filled"
                                color="sage"
                                onClick={() => setEditing(true)}
                            >
                                <IconEdit size={26}/>
                            </ActionIcon>
                        :
                            <div></div>
                        }
                    </Group>
                    <Profile 
                        userPod={props.user.podRootDir} 
                        editing={editing}
                    />
                </PageLoader>
            </Paper>
            </Center>
        );
    }