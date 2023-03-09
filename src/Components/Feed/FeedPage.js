import React from 'react';
import { Title, Paper, Stack, ActionIcon, ScrollArea, Container, Grid, Divider} from '@mantine/core';
import { PageLoader } from '../Core/PageLoader';
import { createFeedDir, doesFeedDirExist } from '../../SOLID/FeedHandler';
import { FeedItemList } from './FeedItemList';
import { IconArrowBack } from '@tabler/icons';
import { PersonView } from '../Connections/PersonView';

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
        this.podRootDir = props.podRootDir;
        this.webId = props.webId
        this.state = {
            view: FeedViewStates.Feed,
            backHistory: [],
            viewPerson: {}
        }
    }

    viewPerson(feedPage, person) {
        let list = feedPage.state.backHistory;
        list.push(FeedViewStates.Feed);
        feedPage.setState(prevState => ({
            ...prevState,
            viewPerson: person,
            backHistory: list,
            view: FeedViewStates.Person
        }))
    }
    
    back(feedPage) {
        let list = feedPage.state.backHistory;
        const newState = list.pop();
        feedPage.setState(prevState => ({
            ...prevState,
            backHistory: list,
            view: newState
        }))
    }

    render() {
        let content;
        if (this.state.view === FeedViewStates.Feed) {
            content = (<Container style={{width: "100%", height: "100%"}}>
                <ScrollArea h="85vh">
                    <FeedItemList 
                        podRootDir={this.podRootDir} 
                        viewPerson={(person) => this.viewPerson(this, person)}
                    />
                </ScrollArea>
            </Container>);
        } else if (this.state.view === FeedViewStates.Person) {
            content = (
                <Paper shadow="md" p="sm">
                    <Stack justify="flex-start" spacing="xs">
                        <Grid grow align="flex-end" justify="space-between">
                            <Grid.Col span={1}>
                                <ActionIcon onClick={() => {this.back(this)}} >
                                    <IconArrowBack />
                                </ActionIcon>
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <Title align="right" order={4}>{this.state.viewPerson.webId}</Title>
                            </Grid.Col>
                        </Grid>
                        <Divider h="md"/>
                        <PersonView person={this.state.viewPerson} />
                    </Stack>
                </Paper>
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
                podRootDir={this.podRootDir}
                podStructureRequired="feed directory"
            >
                {content}
            </PageLoader>
        );
    }
}