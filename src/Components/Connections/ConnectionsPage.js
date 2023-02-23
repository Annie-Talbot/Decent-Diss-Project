import { Paper, Button, Group, Stack, ActionIcon, Title, Divider, Grid } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";
import React from 'react';
import { fetchPeople } from "../../SOLID/ConnectionHandler";
import { CONNECTIONS_DIR, PEOPLE_DATASET } from "../../SOLID/Utils";
import { CreatePersonForm } from "./CreatePersonForm";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { PeopleList } from "./PeopleList";
import { UserView } from "./UserView";

export const ViewStates = {
    Main: 0,
    UserView: 1,
}

export class ConnectionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.connectionsDir = props.app.podRootDir + CONNECTIONS_DIR;
        this.state = {
            currView: ViewStates.Main,
            peopleLoading: true,
            peopleList: [],
            createPersonOpened: false,
        };
        this.viewUserWebID = "";
        this.viewUserPodRoot = "";
    }

    async updatePeople(host) {
        const [peopleList, errorList] = await fetchPeople(host.connectionsDir + PEOPLE_DATASET);
        errorList.forEach((error) => createErrorNotification(error));
        host.setState(prevState => (
            {...prevState, 
            peopleLoading: false,
            peopleList: peopleList,
        }));
    }

    toggleCreatePersonPopup(host) {
        let newState = true;
        if (host.state.createPersonOpened) {
            newState = false;
        }
        host.setState(prevState => (
            {...prevState, 
            createPersonOpened: newState,
        }));
    }

    async componentDidMount() {
        await this.updatePeople(this);
    }

    render() {
        let content = [];
        if (this.state.currView === ViewStates.Main) {
            content.push((
                <>
                    <CreatePersonForm 
                        opened={this.state.createPersonOpened}
                        toggleOpened={() => this.toggleCreatePersonPopup(this)}
                        datasetUrl={this.connectionsDir + PEOPLE_DATASET}
                        updatePeople={() => this.updatePeople(this)}
                    />
                    <Grid grow>
                        <Grid.Col span={4} grow gutter="sm">
                            <Paper shadow="xs" p="md" withBorder>
                                <Stack>
                                    <Group position="apart">
                                        <Title order={2}> People </Title>
                                        <Button
                                            onClick={() => this.toggleCreatePersonPopup(this)}>
                                                Create a Person
                                        </Button>
                                    </Group>
                                    <PeopleList 
                                        host={this} 
                                        people={this.state.peopleList} 
                                        loading={this.state.peopleLoading}/>
                                </Stack>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Paper shadow="xs" p="md" withBorder>
                                <Title order={2}> Group </Title>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </>
            ));
        } else if (this.state.currView === ViewStates.UserView) {
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
