import React from 'react';
import { Title, Paper, Button} from '@mantine/core';
import { PageLoader } from '../Core/PageLoader';
import { createFeedDir, createPostAlert, doesFeedDirExist } from '../../SOLID/FeedHandler';
import { findSocialPodFromWebId} from '../../SOLID/NotificationHandler'
import { createErrorNotification } from '../Core/Notifications/ErrorNotification';
import { FeedItemList } from './PostAlertList';


async function sendPostAlert(recieverWebId, senderWebId, postUrl) {
    // Check we can send a notification first.
    let [personPod, error] = await findSocialPodFromWebId(recieverWebId);
    if (error) {
        createErrorNotification(error);
        return false;
    }
    error = await createPostAlert(personPod, {webId: senderWebId, postUrl: postUrl});
    if (error) {
        createErrorNotification(error);
        return false;
    }
    return true;
}

/**
 * The Posts page of the application. This displays the logged 
 * in user's posts.
 */
export class FeedPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.podRootDir;
        this.webId = props.webId;
    }

    render() {
        return (
            <PageLoader 
                checkFunction={doesFeedDirExist}
                createFunction={createFeedDir}
                podRootDir={this.podRootDir}
                podStructureRequired="feed directory"
            >
                <Paper shadow="sm" p="md">
                    <Button onClick={() => sendPostAlert(this.webId, this.webId, 
                            "https://storage.inrupt.com/c70793cd-0e87-4e30-b52b-337414d0f121/social/posts/g32NuICFHY/")}>
                            create post alert
                    </Button>
                    <FeedItemList podRootDir={this.podRootDir} />
                </Paper>
            </PageLoader>
        );
    }
}