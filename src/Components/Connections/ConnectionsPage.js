import { Paper, Button, Group, Stack, ActionIcon, Title, Divider, Grid } from "@mantine/core";
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
import { IconUserPlus, IconArrowBack, IconHomePlus  } from "@tabler/icons-react";
import { PageHeader } from "../Core/PageHeader";

export const ViewStates = {
    Main: 0,
    PersonView: 1,
    GroupView: 2,
}

export class ConnectionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.user = props.user;
        this.state = {
            currView: ViewStates.Main,
            createPersonOpened: false,
            peoplelistKey: 0,
            createGroupOpened: false,
            groupslistKey: 0,
            backButton: [],
            viewPersonObject: null,
            viewGroupObject: null,
        };
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
        let backHistory = connectionsPage.state.backButton
        backHistory.push(backwardsState)
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.GroupView,
            backButton: backHistory,
            viewGroupObject: group,
        }));
    }

    viewPerson(connectionsPage, person, backwardsState) {
        let backHistory = connectionsPage.state.backButton
        backHistory.push(backwardsState)
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.PersonView,
            backButton: backHistory,
            viewPersonObject: person,
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
                <div key="main-state">
                    <CreatePersonForm 
                        opened={this.state.createPersonOpened}
                        toggleOpened={() => this.toggleCreatePersonPopup(this)}
                        updatePeople={() => this.updatePeople(this)}
                        user={this.user}
                    />
                    <CreateGroupForm 
                        opened={this.state.createGroupOpened}
                        close={() => this.toggleCreateGroupPopup(this)}
                        updateGroups={() => this.updateGroups(this)}
                        user={this.user}
                    />
                    <Grid grow>
                        <Grid.Col span={4} gutter="sm">
                            <Paper shadow="xs" p="md" withBorder>
                                <Stack>
                                    <Group position="apart">
                                        <Title order={2}> People </Title>
                                        <ActionIcon 
                                            size={"xl"} 
                                            variant="light"
                                            onClick={() => this.toggleCreatePersonPopup(this)}
                                            color="sage"
                                        >
                                            <IconUserPlus/>
                                        </ActionIcon>
                                    </Group>
                                    <PeopleList 
                                        key={this.state.peoplelistKey}
                                        podRootDir={this.user.podRootDir}
                                        viewPerson={(person) => this.viewPerson(this, person, ViewStates.Main)}
                                        authorised={true}
                                    />
                                </Stack>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Paper shadow="xs" p="md" withBorder>
                                <Stack>
                                    <Group position="apart">
                                        <Title order={2}> Groups </Title>
                                        <ActionIcon 
                                            size={"xl"} 
                                            variant="light"
                                            onClick={() => this.toggleCreateGroupPopup(this)}
                                            color="sage"
                                        >
                                            <IconHomePlus/>
                                        </ActionIcon>
                                    </Group>
                                    <GroupsList 
                                        host={this}
                                        key={this.state.groupslistKey}
                                        podRootDir={this.user.podRootDir}
                                        viewGroup={(person) => this.viewGroup(this, person, ViewStates.Group)}
                                        authorised={true}
                                    />
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </div>
            ));
        } else if (this.state.currView === ViewStates.PersonView) {
            content.push((
                <Stack key="person-state" justify="flex-start" spacing="xs">
                    <PageHeader
                        back={() => {this.back(this)}}
                        backDisabled={this.state.backButton.length === 0}
                        title='Person View'
                    />
                    <PersonView person={this.state.viewPersonObject} user={this.user}/>
                </Stack>
            ));
        } else if (this.state.currView === ViewStates.GroupView) {
            content.push((
                <Stack key="group-state" justify="flex-start" spacing="xs">
                    <PageHeader
                        back={() => {this.back(this)}}
                        backDisabled={this.state.backButton.length === 0}
                        title='Group View'
                    />
                    <GroupView 
                        groupUrl={this.state.viewGroupObject.url}
                        user={this.user}
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
                    podRootDir={this.user.podRootDir}
                    podStructureRequired="connections directory"
                >
                    {content}
                </PageLoader>
                
            </Paper>
        );
    }
}
