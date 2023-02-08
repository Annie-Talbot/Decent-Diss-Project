import React from 'react';
import { Button, LoadingOverlay, SimpleGrid} from '@mantine/core';
import Post from '../Post';
import { deletePost, fetchPosts } from '../../SOLID/PostHandler';
import { POSTS_DIR } from '../../SOLID/Utils';
import { createErrorNotification } from '../ErrorNotification';

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

    async componentDidMount() {
        await this.updatePosts();
    }

    render() {
        const postComponents = this.state.postList.map((post) => {
            return (<Post post={post} parent={this} />
            )});
        return (
            <div>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
                <Button
                onClick={() => createErrorNotification("BLah blah", "skipabdedoo")}>
                    Balh
                </Button>
                <SimpleGrid 
                cols={3}
                
                breakpoints={[
                    { maxWidth: 1600, cols: 2, spacing: 'sm' },
                    { maxWidth: 1200, cols: 1, spacing: 'sm' },
                ]}>
                    {postComponents}
                </SimpleGrid>
            </div>
        );
    }
}

export default Home;