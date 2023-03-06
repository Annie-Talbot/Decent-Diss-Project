import { Center, Group, Paper, Skeleton, Stack, Text, Title, Button } from "@mantine/core";
import React from "react";
import { createSocialDirectory, findUsersSocialPod } from "../../SOLID/SocialDirHandler";
import { AppStates } from "../Core/Constants/AppStates";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";


function PodButton(props) {
    return (
        <Button
            onClick={async () => {
                const error = await createSocialDirectory(props.pod)
                if (error) {
                    createErrorNotification(error);
                    return;
                }
                props.loadSocialDirectory();
            }}
        >
            {props.pod}
        </Button>
    )
}

export class SocialDirectoryPage extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;
        this.state = {
            loading: true,
            hasSocial: false,
            podOptions: [],
            socialDirectory: ""
        }

    }

    async componentDidMount() {
        const [success, socialRoot, error] = await findUsersSocialPod(this.app.webId);
        if (error) {
            createErrorNotification(error);
            this.setState(prevState => (
                {...prevState, 
                loading: false,
            }))
            return;
        }
        if (!success) {
            this.setState(prevState => (
                {...prevState, 
                loading: false,
                hasSocial: false,
                podOptions: socialRoot
            }))
            return;
        }
        // valid social directory found, go to profile
        this.setState(prevState => (
            {...prevState, 
            loading: false,
            hasSocial: true,
            socialDirectory: socialRoot
        }))
        return;
    }

    loadSocialDirectory(app, podRootDir) {
        app.podRootDir = podRootDir;
        app.setState(prevState => ({
            ...prevState,
            currPage: AppStates.Profile
        }))
    }

    render() {
        const podOptions = this.state.podOptions.map((podRootDir) => (
            <PodButton key={podRootDir} pod={podRootDir} loadSocialDirectory={() => {
                this.loadSocialDirectory(this.app, podRootDir);
            }} />
        ));
        
        return (
            <Paper p="lg">
                <Skeleton visible={this.state.loading}>
                    <Center>
                        {this.state.hasSocial? 
                            <Stack>
                                <Title order={2}>Found your social directory at: </Title>
                                <Text>{this.state.socialDirectory}</Text>
                                <Button onClick={() => this.loadSocialDirectory(this.app, this.state.socialDirectory)}
                                >Use this directory</Button>
                            </Stack>
                        :
                            <Stack>
                                <Title order={2}>No social directory found in any of your pods</Title>
                                <Text>Click the pod you would like to place your social directory into.</Text>
                                <Group>
                                    {podOptions}
                                </Group>
                            </Stack>
                        }
                    </Center>
                </Skeleton>
            </Paper>
        );
    }
}