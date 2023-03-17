import React from 'react';
import { ActionIcon, Text, Button, Center, Group, Paper, Title, Divider} from '@mantine/core';
import { Profile } from './Profile';
import { IconArrowBack } from '@tabler/icons';
import { createSampleProfile, doesProfileExist } from '../../SOLID/ProfileHandler';
import { PageLoader } from '../Core/PageLoader';
import { createConnectionRequest } from '../../SOLID/NotificationHandler';
import { IconClipboardCopy, IconShare2 } from '@tabler/icons-react';
import { createPlainNotification } from '../Core/Notifications/PlainNotification';
import { ShareButton } from '../Core/ShareButton';




class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.podRootDir;
        this.webId = props.webId;

        this.state = {
            editing: false,
        }
    }

    render() {
        return (
            <Paper p="sm" shadow="xs">
                <PageLoader
                    checkFunction={doesProfileExist}
                    createFunction={createSampleProfile}
                    podRootDir={this.podRootDir}
                    podStructureRequired="profile"
                >
                    <Group position="apart" style={{height: "24px", marginBottom: "5px", paddingRight: 20}}>
                        {this.state.editing ?
                            <ActionIcon
                            onClick={() => {this.setState(prevState => (
                                {...prevState, 
                                    editing: false,
                                }))}}
                            >
                            <IconArrowBack />
                        </ActionIcon>
                        : <div></div>}
                        <Group position='flex-end'>
                            <Title order={3}>WebID: </Title>
                            <Text>{this.webId}</Text>
                        </Group>
                        
                    </Group>
                    <Divider m="md" h="sm"/>
                    <Profile 
                        userPod={this.podRootDir} 
                        editing={this.state.editing}
                    />
                    <Center>
                        {!this.state.editing &&
                            <Button
                                onClick={() => this.setState(prevState => ({
                                ...prevState,
                                editing: true,
                                }))
                            }>
                                Edit
                            </Button>
                        }
                    </Center>
                </PageLoader>
            </Paper>
        );
    }
}

export default ProfilePage;