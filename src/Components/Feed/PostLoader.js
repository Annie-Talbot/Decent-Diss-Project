import { Center, Paper, Skeleton, Text, Stack, Title } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { fetchPost } from "../../SOLID/PostHandler";
import { findPerson } from "../../SOLID/Connections/PeopleHandler";
import { Post } from "../Posts/Post";
import { deleteFeedItem } from "../../SOLID/FeedHandler";

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

export function PostLoader(props) {
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState({});
    const [person, setPerson] = useState({webId: props.feedItem.senderWebId});
    const [error, setError] = useState(null);
    const target = useRef(0);
    let observer;

    useEffect(() => {
        fetchPost(props.feedItem.postContainer).then(([fetchedPost, error]) => {
            if (error) setError(error.title);
            if (fetchedPost) setPost(fetchedPost);
        }).then(async () => {
            setPerson(await findPerson(props.podRootDir, props.feedItem.senderWebId));
            setLoading(false);
        }).then(() => {
            observer = new IntersectionObserver((entries) => 
            inViewChange(entries, () => handleDeletePostAlert(props.feedItem.url)), 
            {
                root: null, 
                threshold: [0.95],
                margin: "60px 5px 5px 5px"
            });
            if (target.current) observer.observe(target.current);
        });
        return () => {
            if (target.current) observer.unobserve(target.current);
            observer.disconnect();
          };
    }, [props.feedItem.postContainer]);
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
                />
            </div>
                
            }
        </Skeleton>
    );
}