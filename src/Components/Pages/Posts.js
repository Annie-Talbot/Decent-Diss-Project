import React from 'react';
import { Button, Center, Divider, LoadingOverlay, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon, Flex, Grid} from '@mantine/core';
import { fetchPosts } from '../../SOLID/PostHandler';
import { POSTS_DIR } from '../../SOLID/Utils';
import { createErrorNotification } from '../ErrorNotification';
import { IconBeach } from '@tabler/icons';
import { PostGrid } from '../PostGrid';
import { CreatePostForm } from '../CreatePostForm';

/**
 * The Posts page of the application. This displays the logged 
 * in user's posts.
 */
export class PostsPage extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;

        this.state = {
            loading: true,
            postList: [],
            createPostOpened: false,
        }
    }

    async updatePosts(host) {
        console.log("updating posts");
        const [postList, errorList] = await fetchPosts(host.app.podRootDir + POSTS_DIR);
        errorList.forEach((error, i) => createErrorNotification(error));
        console.log(host.state.postList);
        host.setState(prevState => (
            {...prevState, 
            loading: false,
            postList: postList,
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

    async componentDidMount() {
        await this.updatePosts(this);
    }

    render() {
        return (
            <div style={{height: "90vh",
            display: "grid", 
            gridTemplateRows: "calc(100% - 100px) 100px",
            gridTemplateColumns: "100%"}}>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
                <CreatePostForm 
                    opened={this.state.createPostOpened}
                    toggleOpened={() => this.toggleCreatePostPopup(this)}
                    postDir={this.app.podRootDir + POSTS_DIR}
                    updatePosts={() => this.updatePosts(this)}
                    />
                <ScrollArea offsetScrollbars style={{gridRow: "1", gridColumn: "1"}}>
                    {this.state.postList.length > 0 ? 
                        <PostGrid 
                            authorised={true}
                            posts={this.state.postList}
                            host={this}
                            /> :
                        <Stack align="center" justify="center" style={{height: "100%"}}>
                            <ThemeIcon 
                            variant="light"
                            size="xl">
                                <IconBeach />
                            </ThemeIcon>
                            <Text size={"lg"}>Looks like you have no posts...</Text>
                            <Text>To create one, press the button below.</Text>
                        </Stack>
                    }                    
                </ScrollArea>
                <div style={{gridRow: "2", gridColumn: "1"}}>
                    <Stack spacing="xs">
                        <Divider my="md"/>
                        <Center>
                            <Button
                            onClick={() => this.toggleCreatePostPopup(this)}>
                                Create a Post
                            </Button>
                        </Center>
                    </Stack>
                </div>
            </div>
        );
    }
}