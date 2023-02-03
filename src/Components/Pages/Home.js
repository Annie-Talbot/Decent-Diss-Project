import React from 'react';
import { LoadingOverlay, SimpleGrid} from '@mantine/core';
import Post from '../Post';
import fetchPosts from '../../SOLID/PostFetcher';
import { POSTS_DIR } from '../../SOLID/Utils';

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

    async componentDidMount() {
        let postList = await fetchPosts(this.app.podRootDir + POSTS_DIR);

        this.setState(prevState => (
            {...prevState, 
            loading: false,
            postList: postList,
        }))

    }

    render() {
        const postComponents = this.state.postList.map((post) => {
            return (<Post post={post} />
            )});
        return (
            <div>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
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