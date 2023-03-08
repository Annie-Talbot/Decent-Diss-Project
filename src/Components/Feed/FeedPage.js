import React from 'react';
import { Title, Paper, Button, ScrollArea, Container} from '@mantine/core';
import { PageLoader } from '../Core/PageLoader';
import { createFeedDir, createPostAlert, doesFeedDirExist } from '../../SOLID/FeedHandler';
import { findSocialPodFromWebId} from '../../SOLID/NotificationHandler'
import { createErrorNotification } from '../Core/Notifications/ErrorNotification';
import { FeedItemList } from './FeedItemList';


async function sendPostAlert(recieverWebId, senderWebId, postUrl) {
    // Check we can send a post alert first.
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


function callback(entries, observer) {
    entries.forEach((entry) => {
        console.log("Intersection registered.");
        console.log(entry);
        observer.unobserve(entry.target);
    });
}

function createObserver(observer, targets) {
    return (event) => {
        console.log("here")
        observer = new IntersectionObserver(callback, {root: null, threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]});
        targets = document.getElementsByClassName("target");
        targets.forEach((target) => observer.observe(target));
    }
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
                {/* <Button onClick={() => sendPostAlert(this.webId, this.webId, 
                            "https://storage.inrupt.com/c70793cd-0e87-4e30-b52b-337414d0f121/social/posts/g32NuICFHY/")}>
                            create post alert
                </Button> */}
                <Container style={{width: "100%", height: "100%"}}>
                    <ScrollArea h="85vh">
                        <FeedItemList podRootDir={this.podRootDir} observer={this.observer}/>
                    </ScrollArea>
                </Container>      
            </PageLoader>
        );
    }
}