import React from 'react';
import { Button, Center, Divider, ScrollArea, Stack, Text, ThemeIcon, Skeleton, ActionIcon} from '@mantine/core';
import { IconBeach } from '@tabler/icons';
import { PostGrid } from './PostGrid';
import { CreatePostForm } from './CreatePostForm';
import { createPostsDir, doesPostsDirExist } from '../../SOLID/PostHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconSquareRoundedPlusFilled } from '@tabler/icons-react';


function EmptyPosts(props) {
    return (
        <Stack align="center" justify="center" style={{height: "100%"}}>
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>Looks like you have no posts...</Text>
            <Text>To create one, press the button below.</Text>
        </Stack>
    );
    }



/**
 * The Posts page of the application. This displays the logged 
 * in user's posts.
 */
export class PostsPage extends React.Component {
    constructor(props) {
        super(props);
        this.webId = props.webId;
        this.podRootDir = props.podRootDir;
        this.state = {
            createPostOpened: false,
            postgridKey: 0,
        }
    }

    updatePosts(postsPage) {
        postsPage.setState(prevState => (
            {...prevState,
            postgridKey: postsPage.state.postgridKey + 1,
        }));
    }
    
    toggleCreatePostPopup(homePage) {
        let newState = true;
        if (homePage.state.createPostOpened) {
            newState = false;
        }
        homePage.setState(prevState => (
            {...prevState, 
            createPostOpened: newState,
        }));
    }

    render() {

        return (
            <div style={{height: "90vh",
            display: "grid", 
            gridTemplateRows: "calc(100% - 100px) 100px",
            gridTemplateColumns: "100%"}}>
                <PageLoader 
                    checkFunction={doesPostsDirExist}
                    createFunction={createPostsDir}
                    podRootDir={this.podRootDir}
                    podStructureRequired="posts directory"
                >
                    <CreatePostForm 
                        opened={this.state.createPostOpened}
                        toggleOpened={() => this.toggleCreatePostPopup(this)}
                        updatePosts={() => this.updatePosts(this)}
                        podRootDir={this.podRootDir}
                        webId={this.webId}
                        />
                    <ScrollArea offsetScrollbars style={{gridRow: "1", gridColumn: "1"}}>
                        <PostGrid
                            author={{webId: this.webId, nickname: "Myself"}}
                            key={this.state.postgridKey}
                            authorised={true}
                            podRootDir={this.podRootDir}
                            emptyComponent={<EmptyPosts/>}
                            />             
                    </ScrollArea>
                    <div style={{gridRow: "2", gridColumn: "1"}}>
                        <Stack spacing="xs">
                            <Divider my="md"/>
                            <Center>
                                <ActionIcon
                                    size="xl"
                                    color="sage"
                                    onClick={() => this.toggleCreatePostPopup(this)}
                                >
                                    <IconSquareRoundedPlusFilled size={57}/>
                                </ActionIcon>
                            </Center>
                        </Stack>
                    </div>
                </PageLoader>
            </div>
        );
    }
}