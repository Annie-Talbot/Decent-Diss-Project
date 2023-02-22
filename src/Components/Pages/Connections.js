import { Text, Paper, Button, Group, Stack, ActionIcon, Title, Divider } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";
import React from 'react';
import { isWebIdDecent } from "../../SOLID/ConnectionHandler";
import { createErrorNotification } from "../ErrorNotification";
import { createPlainNotification } from "../PlainNotification";
import { UserView } from "../UserView";

const ViewStates = {
    Main: 0,
    UserView: 1,
}

export class ConnectionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currView: ViewStates.Main
        };
        this.viewUserWebID = "";
        this.viewUserPodRoot = "";
    }

    async viewAnotherUser(page) {
        const webID = "https://id.inrupt.com/talb";
        let [podRoot, error] = await isWebIdDecent(webID);
        if (error) {
            createErrorNotification(error);
            return;
        }
        createPlainNotification({
            title: "Success!",
            description: "This user does have a Decent profile!!"
        });
        
        page.viewUserPodRoot = podRoot;
        page.viewUserWebID = webID;
        page.setState(prevState => (
            {...prevState, 
                currView: ViewStates.UserView,
        }));
    
    }

    render() {
        let content = [];
        if (this.state.currView == ViewStates.Main) {
            content.push((
                <>
                    <Text>The connections page bah!!</Text>
                    <Button onClick={() => {
                        this.viewAnotherUser(this)
                    }}>
                        Go to at698's profile
                    </Button>
                </>
            ));
        } else if (this.state.currView == ViewStates.UserView) {
            content.push((
                <Stack justify="flex-start" spacing="xs">
                    <Group position="apart">
                        <ActionIcon onClick={
                            () => {this.setState(prevState => (
                                {...prevState, 
                                    currView: ViewStates.Main,
                            })
                            )}
                        }>
                            <IconArrowBack />
                        </ActionIcon>
                        <Title order={2}>{this.viewUserWebID}</Title>
                    </Group>
                    <Divider h="md"/>
                    <UserView webID={this.viewUserWebID} podRoot={this.viewUserPodRoot}/>
                </Stack>
            ));
        } else {
            this.setState(prevState => (
                {...prevState, 
                    currView: ViewStates.Main,
            }));
        }


        return (
            <Paper p="sm" shadow="xs">
                {content}
            </Paper>
        );
    }
}
