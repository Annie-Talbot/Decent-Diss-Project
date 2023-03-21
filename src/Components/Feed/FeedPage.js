import React from 'react';
import { Title, Paper, Stack, ActionIcon, ScrollArea, Container, Grid, Divider, Button, Center, Group} from '@mantine/core';
import { PageLoader } from '../Core/PageLoader';
import { createFeedDir, doesFeedDirExist } from '../../SOLID/FeedHandler';
import { FeedItemList } from './FeedItemList';
import { IconArrowBack, IconSettings } from '@tabler/icons';
import { PersonView } from '../Connections/PersonView';
import { AppendSettings } from './AppendSettings';
import { SettingsButton } from './SettingsButton';
import { PageHeader } from '../Core/PageHeader';

const FeedViewStates = {
    Feed: 0,
    Person: 1,
    Settings: 2,
}

/**
 * The Posts page of the application. This displays the logged 
 * in user's posts.
 */
export class FeedPage extends React.Component {
    constructor(props) {
        super(props);
        this.user = props.user;
        this.state = {
            view: FeedViewStates.Feed,
            backHistory: [],
            viewPerson: {}
        }
    }

    viewPerson(feedPage, person) {
        feedPage.setState(prevState => ({
            ...prevState,
            viewPerson: person,
        }))
        feedPage.forward(feedPage, FeedViewStates.Person);
    }

    viewSettings(feedPage) {
        feedPage.forward(feedPage, FeedViewStates.Settings);
    }
    
    back(feedPage) {
        let backHistory = feedPage.state.backHistory;
        let newState = backHistory.pop();
        feedPage.setState(prevState => (
            {...prevState, 
                view: newState,
                backHistory: backHistory
        }))
    }

    forward(feedPage, newState) {
        let backHistory = feedPage.state.backHistory;
        backHistory.push(feedPage.state.view);
        feedPage.setState(prevState => ({
            ...prevState,
            view: newState,
            backHistory: backHistory
        }));
    }

    render() {
        let content;
        if (this.state.view === FeedViewStates.Feed) {
            content = (
                    <ScrollArea h="85vh">
                        <FeedItemList
                            user={this.user}
                            viewPerson={(person) => this.viewPerson(this, person)}
                        />
                    </ScrollArea>
            );
        } else if (this.state.view === FeedViewStates.Person) {
            content = (
                <PersonView person={this.state.viewPerson} user={this.user}/>
            )
        } else if (this.state.view === FeedViewStates.Settings) {
            content = (
                <AppendSettings
                    podRootDir={this.user.podRootDir}
                />
            )
        } else {
            this.setState({
                view: FeedViewStates.Feed,
                backHistory: []
            });
        }
        return (
            <PageLoader 
                checkFunction={doesFeedDirExist}
                createFunction={createFeedDir}
                podRootDir={this.user.podRootDir}
                podStructureRequired="feed directory"
            >

                <Paper shadow="md" p="md">
                    <Stack>
                        <PageHeader
                            back={() => this.back(this)}
                            backDisabled={this.state.backHistory.length === 0}
                            title={this.state.view === FeedViewStates.Settings? 'Feed Settings': 'Feed'}
                            actionButton={<SettingsButton onClick={() => this.viewSettings(this)}/>}
                            actionDisabled={this.state.view !== FeedViewStates.Feed}
                        />
                        {content}
                    </Stack>
                </Paper>
            </PageLoader>
        );
    }
}