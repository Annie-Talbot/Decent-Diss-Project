import { Paper, Button, Group, Stack, ActionIcon, Title, Divider, Grid } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";
import React from 'react';
import { CONNECTIONS_DIR, PEOPLE_DATASET } from "../../SOLID/Utils";
import { CreatePersonForm } from "./CreatePersonForm";
import { PeopleList } from "./PeopleList";
import { UserView } from "./UserView";
import { PageLoader } from '../Core/PageLoader';
import { createConnectionsDir, doesConnectionsDirExist } from "../../SOLID/ConnectionHandler";

export const ViewStates = {
    Main: 0,
    UserView: 1,
}

export class ConnectionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.app.podRootDir;
        this.state = {
            currView: ViewStates.Main,
            createPersonOpened: false,
            peoplelistKey: 0,
        };
        this.viewUserWebID = "";
        this.viewUserPodRoot = "";
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


    updatePeople(connectionsPage) {
        connectionsPage.setState(prevState => ({
            ...prevState,
            peoplelistKey: connectionsPage.state.peoplelistKey + 1
        }))
    }

    render() {
        let content = [];
        if (this.state.currView === ViewStates.Main) {
            content.push((
                <>
                    <CreatePersonForm 
                        opened={this.state.createPersonOpened}
                        toggleOpened={() => this.toggleCreatePersonPopup(this)}
                        datasetUrl={this.podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET}
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
                                        podRootDir={this.podRootDir}
                                    />
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
                <PageLoader
                    checkFunction={doesConnectionsDirExist}
                    createFunction={createConnectionsDir}
                    podRootDir={this.podRootDir}
                    podStructureRequired="connections directory"
                >
                    {content}
                </PageLoader>
                
            </Paper>
        );
    }
}
