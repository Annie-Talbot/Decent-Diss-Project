import { Paper, Button, Group, Stack, ActionIcon, Title, Divider, Grid } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";
import React from 'react';
import { CONNECTIONS_DIR, PEOPLE_DATASET } from "../../SOLID/Utils";
import { CreatePersonForm } from "./CreatePersonForm";
import { PeopleList } from "./PeopleList";
import { PersonView } from "./PersonView";
import { PageLoader } from '../Core/PageLoader';
import { createConnectionsDir, doesConnectionsDirExist } from "../../SOLID/Connections/ConnectionHandler";
import { GroupsList } from "./GroupList";
import { CreateGroupForm } from "./CreateGroupForm";
import { GroupView } from "./GroupView";

export const ViewStates = {
    Main: 0,
    PersonView: 1,
    GroupView: 2,
}

export class ConnectionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.app.podRootDir;
        this.state = {
            currView: ViewStates.Main,
            createPersonOpened: false,
            peoplelistKey: 0,
            createGroupOpened: false,
            groupslistKey: 0,
            backButton: []
        };
        this.viewPersonObject = null;
        this.viewGroupObject = null;
    }

    toggleCreateGroupPopup(connectionsPage) {
        let newState = true;
        if (connectionsPage.state.createGroupOpened) {
            newState = false;
        }
        connectionsPage.setState(prevState => (
            {...prevState, 
            createGroupOpened: newState,
        }));
    }


    updateGroups(connectionsPage) {
        connectionsPage.setState(prevState => ({
            ...prevState,
            groupslistKey: connectionsPage.state.groupslistKey + 1
        }))
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

    viewGroup(connectionsPage, group, backwardsState) {
        connectionsPage.viewGroupObject = group;
        let backHistory = connectionsPage.state.backButton
        backHistory.push(backwardsState)
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.GroupView,
            backButton: backHistory
        }));
    }

    viewPerson(connectionsPage, person, backwardsState) {
        connectionsPage.viewPersonObject = person;
        let backHistory = connectionsPage.state.backButton
        backHistory.push(backwardsState)
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.PersonView,
            backButton: backHistory
        }));
    }

    back(connectionsPage) {
        let backHistory = connectionsPage.state.backButton
        let newState = backHistory.pop();
        connectionsPage.setState(prevState => (
            {...prevState, 
                currView: newState,
                backButton: backHistory
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
                        webId={this.props.app.webId}
                        pod={this.podRootDir}
                    />
                    <CreateGroupForm 
                        opened={this.state.createGroupOpened}
                        close={() => this.toggleCreateGroupPopup(this)}
                        updateGroups={() => this.updateGroups(this)}
                        podRootDir={this.podRootDir}
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
                                        key={this.state.peoplelistKey}
                                        podRootDir={this.podRootDir}
                                        viewPerson={(person) => this.viewPerson(this, person, ViewStates.Main)}
                                    />
                                </Stack>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Paper shadow="xs" p="md" withBorder>
                                <Stack>
                                    <Group position="apart">
                                        <Title order={2}> Groups </Title>
                                        <Button
                                            onClick={() => this.toggleCreateGroupPopup(this)}>
                                                Create a Group
                                        </Button>
                                    </Group>
                                    <GroupsList 
                                        host={this}
                                        key={this.state.groupslistKey}
                                        podRootDir={this.podRootDir}
                                        viewGroup={(person) => this.viewGroup(this, person, ViewStates.Group)}
                                    />
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </>
            ));
        } else if (this.state.currView === ViewStates.PersonView) {
            content.push((
                <Stack justify="flex-start" spacing="xs">
                    <Grid grow align="flex-end" justify="space-between">
                        <Grid.Col span={1}>
                            <ActionIcon onClick={() => {this.back(this)}} >
                                <IconArrowBack />
                            </ActionIcon>
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <Title align="right" order={2}>{this.viewPersonObject.webId}</Title>
                        </Grid.Col>
                    </Grid>
                    <Divider h="md"/>
                    <PersonView person={this.viewPersonObject} />
                </Stack>
            ));
        } else if (this.state.currView === ViewStates.GroupView) {
            content.push((
                <Stack justify="flex-start" spacing="xs">
                    <Grid grow align="flex-end" justify="space-between">
                        <Grid.Col span={1}>
                            <ActionIcon onClick={() => {this.back(this)}} >
                                <IconArrowBack />
                            </ActionIcon>
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <Title align="right" order={4}>{this.viewGroupObject.url}</Title>
                        </Grid.Col>
                    </Grid>
                    <Divider h="md"/>
                    <GroupView 
                        groupUrl={this.viewGroupObject.url}
                        podRootDir={this.podRootDir}
                        viewPerson={(person) => this.viewPerson(this, person, ViewStates.GroupView)}
                    />
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
