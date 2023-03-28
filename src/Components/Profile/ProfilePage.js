import React, { useState } from 'react';
import { ActionIcon, Paper} from '@mantine/core';
import { Profile } from './Profile';
import { createSampleProfile, doesProfileExist } from '../../SOLID/ProfileHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconEdit } from '@tabler/icons-react';
import { PageHeader } from '../Core/PageHeader';


export function ProfilePage(props) {
    const [editing, setEditing] = useState(false);
    const [profileKey, setProfileKey] = useState(0);

    return (
        <Paper p="sm" shadow="xs">
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
                    key={profileKey} 
                    userPod={props.user.podRootDir} 
                    editing={editing}
                    stopEditing={() => setEditing(false)}
                    update={() => setProfileKey(profileKey + 1)}
                />
            </PageLoader>
        </Paper>
    );
}