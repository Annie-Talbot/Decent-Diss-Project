import React from 'react';
import { ActionIcon, Button, Center, Group, Paper} from '@mantine/core';
import { Profile } from './Profile';
import { IconArrowBack } from '@tabler/icons';


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;

        this.state = {
            profileData: {},
            editing: false,
        }
    }

    render() {
        console.log("editing: " + this.state.editing);
        return (
            <Paper p="sm" shadow="xs">
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
                    userPod={this.app.podRootDir} 
                    profileData={this.state.profileData} 
                    editing={this.state.editing}
                />
                <Center>
                    {!this.state.editing &&
                        <Button visible={this.state.editing} 
                            onClick={() => this.setState(prevState => ({
                            ...prevState,
                            editing: true,
                            }))
                        }>
                            Edit
                        </Button>
                    }
                </Center>
                
            </Paper>
        );
    }
}

export default ProfilePage;