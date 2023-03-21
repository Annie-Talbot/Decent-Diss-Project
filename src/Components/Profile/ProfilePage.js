import React, { useState } from 'react';
import { ActionIcon, Text, Center, Group, Paper, Title, Divider} from '@mantine/core';
import { Profile } from './Profile';
import { IconArrowBack } from '@tabler/icons';
import { createSampleProfile, doesProfileExist } from '../../SOLID/ProfileHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconEdit } from '@tabler/icons-react';
import { PageHeader } from '../Core/PageHeader';


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
                    <PageHeader
                        back={() => setEditing(false)}
                        backDisabled={!editing}
                        title={'Your Profile'}
                        actionButton={
                            <ActionIcon
                                size="lg"
                                variant="light"
                                color="sage"
                                onClick={() => setEditing(true)}
                            >
                                <IconEdit size={26}/>
                            </ActionIcon>
                        }
                        actionDisabled={editing}
                    />
                    <Profile 
                        userPod={props.user.podRootDir} 
                        editing={editing}
                    />
                </PageLoader>
            </Paper>
            </Center>
        );
    }