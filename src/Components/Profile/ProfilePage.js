import React from 'react';
import { ActionIcon, Button, Center, Group, Paper} from '@mantine/core';
import { Profile } from './Profile';
import { IconArrowBack } from '@tabler/icons';
import { createSampleProfile, doesProfileExist } from '../../SOLID/ProfileHandler';
import { PageLoader } from '../Core/PageLoader';
import { createConnectionRequest } from '../../SOLID/NotificationHandler';


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.podRootDir;

        this.state = {
            editing: false,
        }
    }

    render() {
        return (
            <Paper p="sm" shadow="xs">
                <Button onClick={() => createConnectionRequest({
                            webId: "https://id.inrupt.com/at698",
                            msg: "Hi, this is at698. Add me to your contacts!",
                            socialPod: this.podRootDir
                        }, this.podRootDir)}>
                        create notification
                    </Button>
                <PageLoader
                    checkFunction={doesProfileExist}
                    createFunction={createSampleProfile}
                    podRootDir={this.podRootDir}
                    podStructureRequired="profile"
                >
                    <Group position="flex-start" style={{height: "24px", marginBottom: "5px"}}>
                        {this.state.editing? <ActionIcon
                            onClick={() => {this.setState(prevState => (
                                {...prevState, 
                                    editing: false,
                                }))}}
                        >
                            <IconArrowBack />
                        </ActionIcon>: <></>}
                    </Group>
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