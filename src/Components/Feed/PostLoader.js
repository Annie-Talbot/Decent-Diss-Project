import { Center, Paper, Skeleton, Text, Stack, Title } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { fetchPost } from "../../SOLID/PostHandler";
import { findPerson } from "../../SOLID/Connections/PeopleHandler";
import { Post } from "../Posts/Post";
import { deleteFeedItem } from "../../SOLID/FeedHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { sendLike } from "../../SOLID/NotificationHandler";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";

function handleDeletePostAlert(feedItemUrl) {
    deleteFeedItem(feedItemUrl);
}

function inViewChange(entries, deletePostAlert) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            deletePostAlert();
        }
    });
}

async function handleSendLike(senderWebId, post, author) {
    createLoadingNotification("sending-like-" + post.url, "Sending like...", "", 
        () => sendLike(senderWebId, post.url, author.webId), () => {});
}

export function PostLoader(props) {
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState({});
    const [person, setPerson] = useState({webId: props.feedItem.senderWebId});
    const [error, setError] = useState(null);
    const target = useRef(0);
    let observer;

    useEffect(() => {
        fetchPost(props.feedItem.postContainer, false).then((result) => {
            if (!result.success) setError(result.error.title);
            else setPost(result.post);
        }).then(async () => {
            setPerson(await findPerson(props.user.podRootDir, props.feedItem.senderWebId));
            setLoading(false);
        }).then(() => {
            observer = new IntersectionObserver((entries) => 
            inViewChange(entries, () => handleDeletePostAlert(props.feedItem.url)), 
            {
                root: null, 
                threshold: [0.95],
                margin: "60px 5px 5px 5px"
            });
            if (target.current && observer) observer.observe(target.current);
        });
        return () => {
            if (target.current && observer) observer.unobserve(target.current);
            if (observer) observer.disconnect();
          };
    }, [props]);
    return (
        <Skeleton visible={loading} >
            {error?
                <Paper>
                    <Center>
                        <Stack>
                            <Title order={4}>Unable to load post</Title>
                            <Text>Error: {error}</Text>
                            <Text>Post Author: {props.feedItem.senderWebId}</Text>
                        </Stack>
                    </Center>
                </Paper>
            :
            <div ref={target}>
                <Post
                    author={person}
                    post={post}
                    authorised={false}
                    viewPerson={() => props.viewPerson(person)}
                    sendLike={() => handleSendLike(props.user.webId, post, person)}
                />
            </div>
                
            }
        </Skeleton>
    );
}