import React from 'react';
import { Button, Center, Divider, LoadingOverlay, SimpleGrid, Stack, Text, ThemeIcon} from '@mantine/core';
import Post from '../Post';
import { deletePost, fetchPosts } from '../../SOLID/PostHandler';
import { POSTS_DIR } from '../../SOLID/Utils';
import { createErrorNotification } from '../ErrorNotification';
import { IconBeach } from '@tabler/icons';
import { PostGrid } from '../PostGrid';
import { CreatePostForm } from '../CreatePostForm';

/**
 * The Home page of the application. This displays the logged 
 * in user's posts.
 */
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;

        this.state = {
            loading: true,
            postList: [],
            createPostOpened: false,
        }
    }

    async updatePosts() {
        const [postList, errorList] = await fetchPosts(this.app.podRootDir + POSTS_DIR);
        errorList.forEach((error, i) => createErrorNotification(error));

        this.setState(prevState => (
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
        await this.updatePosts();
    }

    render() {
        const postComponents = this.state.postList.map((post) => {
            return (<Post post={post} parent={this} />
            )});
        return (
            <div style={{height: "100%"}}>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
                <CreatePostForm 
                    opened={this.state.createPostOpened}
                    toggleOpened={() => this.toggleCreatePostPopup(this)}
                    postDir={this.app.podRootDir + POSTS_DIR}
                    />
                <div style={{height: "85%", width: "100%", overflowY: "scroll"}}>
                    {postComponents.length > 0 ? 
                        PostGrid(postComponents) :
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
                </div>
                <div style={{height: "15%", width: "100%", display: "sticky"}}>
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

export default Home;