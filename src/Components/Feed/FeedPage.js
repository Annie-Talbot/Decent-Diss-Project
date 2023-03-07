import React from 'react';
import { Title, Paper} from '@mantine/core';
import { PageLoader } from '../Core/PageLoader';


/**
 * The Posts page of the application. This displays the logged 
 * in user's posts.
 */
export class FeedPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.podRootDir;
    }

    render() {

        return (
                // <PageLoader 
                //     checkFunction={doesPostsDirExist}
                //     createFunction={createPostsDir}
                //     podRootDir={this.podRootDir}
                //     podStructureRequired="posts directory"
                // >
                    <Paper>
                        <Title>Bah</Title>
                    </Paper>
                // </PageLoader>
        );
    }
}