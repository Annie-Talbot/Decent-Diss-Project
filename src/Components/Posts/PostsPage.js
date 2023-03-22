import React from 'react';
import { ScrollArea, Stack, Text, ThemeIcon, ActionIcon, Title, Paper, Group} from '@mantine/core';
import { IconBeach } from '@tabler/icons';
import { PostGrid } from './PostGrid';
import { CreatePostForm } from './CreatePostForm';
import { createPostsDir, doesPostsDirExist, POST_ACCESS_TYPES } from '../../SOLID/PostHandler';
import { PageLoader } from '../Core/PageLoader';
import { IconSquareRoundedPlusFilled } from '@tabler/icons-react';
import { PageHeader } from '../Core/PageHeader';


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
            post: {
                title: "",
                accessList: [],
                accessType: POST_ACCESS_TYPES.Public.toString(),
                accessGroups: []
            },
        }
    }

    editPost(postsPage, newPost) {
        postsPage.setState(prevState => ({
            ...prevState,
            post: {
                ...newPost, 
                accessList: [],
                accessType: newPost.accessType.toString(),
            },
            createPostOpened: true
        }));
    }

    createPost(postsPage) {
        postsPage.setState(prevState => ({
            ...prevState,
            post: {
                title: "",
                accessList: [],
                accessType: POST_ACCESS_TYPES.Public.toString(),
                accessGroups: []
            },
            createPostOpened: true,
        }));
    }

    closePopup(postsPage) {
        postsPage.setState(prevState => ({
            ...prevState,
            createPostOpened: false,
        }));
    }

    updatePosts(postsPage) {
        postsPage.setState(prevState => (
            {...prevState,
            postgridKey: postsPage.state.postgridKey + 1,
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
                        close={() => this.closePopup(this)}
                        updatePosts={() => this.updatePosts(this)}
                        user={this.user}
                        post={this.state.post}
                        setPost={(post) => this.setState(prevState => ({
                            ...prevState,
                            post: post,
                        }))}
                    />
                    <Stack>
                        <PageHeader
                            title={'Your Posts'}
                            actionButton={
                                <ActionIcon
                                    size="xl"
                                    color="sage"
                                    onClick={() => this.createPost(this)}
                                >
                                    <IconSquareRoundedPlusFilled size={57}/>
                                </ActionIcon>
                            }
                            actionDisabled={false}
                        />
                        <ScrollArea offsetScrollbars style={{gridRow: "1", gridColumn: "1"}}>
                            <PostGrid
                                author={{webId: this.user.webId, nickname: "Myself"}}
                                key={this.state.postgridKey}
                                authorised={true}
                                user={this.user}
                                emptyComponent={<EmptyPosts/>}
                                editPost={(post) => this.editPost(this, post)}
                                />             
                        </ScrollArea>
                    </Stack>
                </PageLoader>
            </Paper>
        );
    }
}