import { Center, Paper, Skeleton, Text, Stack, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { fetchPost } from "../../SOLID/PostHandler";
import { Post } from "../Posts/Post";



export function PostLoader(props) {
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost(props.feedItem.postContainer).then(([fetchedPost, error]) => {
            if (error) setError(error.title);
            if (fetchedPost) setPost(fetchedPost);
            setLoading(false);
        })
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
                <Post
                    post={post}
                    authorised={false}
                />
            }
        </Skeleton>
    );
}