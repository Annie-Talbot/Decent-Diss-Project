import React from 'react';
import { ScrollArea, Stack, Text, ThemeIcon, ActionIcon, Title, Paper, Group} from '@mantine/core';
import { IconBeach } from '@tabler/icons';
import { PostGrid } from './PostGrid';
import { CreatePostForm } from './CreatePostForm';
import { createPostsDir, doesPostsDirExist } from '../../SOLID/PostHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconSquareRoundedPlusFilled } from '@tabler/icons-react';


function EmptyPosts() {
    return (
        <Stack align="center" justify="center" style={{height: "100%", marginTop: 64, marginBottom: 64}}>
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>Looks like you have no posts...</Text>
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
        this.user = props.user;
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
            <Paper shadow="md" p="md" withBorder >
                <PageLoader 
                    checkFunction={doesPostsDirExist}
                    createFunction={createPostsDir}
                    podRootDir={this.user.podRootDir}
                    podStructureRequired="posts directory"
                >
                    <CreatePostForm 
                        opened={this.state.createPostOpened}
                        toggleOpened={() => this.toggleCreatePostPopup(this)}
                        updatePosts={() => this.updatePosts(this)}
                        user={this.user}
                    />
                    <Stack>
                        <Group position="apart" 
                            style={{
                                height: "24px", 
                                marginBottom: "20px", 
                                paddingRight: 20,
                                paddingLeft: 20,
                            }}
                        >
                            <Title>Your Posts</Title>
                            <ActionIcon
                                size="xl"
                                color="sage"
                                onClick={() => this.toggleCreatePostPopup(this)}
                            >
                                <IconSquareRoundedPlusFilled size={57}/>
                            </ActionIcon>
                        </Group>
                        <ScrollArea offsetScrollbars style={{gridRow: "1", gridColumn: "1"}}>
                            <PostGrid
                                author={{webId: this.user.webId, nickname: "Myself"}}
                                key={this.state.postgridKey}
                                authorised={true}
                                user={this.user}
                                emptyComponent={<EmptyPosts/>}
                                />             
                        </ScrollArea>
                    </Stack>
                </PageLoader>
            </Paper>
        );
    }
}