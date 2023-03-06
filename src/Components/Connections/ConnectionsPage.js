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

    viewGroup(connectionsPage, group) {
        connectionsPage.viewGroupObject = group;
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.GroupView
        }));
    }

    viewPerson(connectionsPage, person) {
        connectionsPage.viewPersonObject = person;
        connectionsPage.setState(prevState => ({
            ...prevState,
            currView: ViewStates.PersonView
        }));
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
                                        host={this} 
                                        podRootDir={this.podRootDir}
                                        viewPerson={this.viewPerson}
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
                                        viewGroup={this.viewGroup}
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
                        <Title order={2}>{this.viewPersonObject.webId}</Title>
                    </Group>
                    <Divider h="md"/>
                    <PersonView person={this.viewPersonObject} />
                </Stack>
            ));
        } else if (this.state.currView === ViewStates.GroupView) {
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
                        <Title order={2}>{this.viewGroup.name}</Title>
                    </Group>
                    <Divider h="md"/>
                    {/* <UserView webID={this.viewUserWebID} podRoot={this.viewUserPodRoot}/> */}
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
