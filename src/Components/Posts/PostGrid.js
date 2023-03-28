import { Center, SimpleGrid, Skeleton } from "@mantine/core";
import { deletePost, fetchPosts } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import {Post} from "./Post";
import { useState, useEffect } from "react";
import { POSTS_DIR } from "../../SOLID/Utils";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { sendLike } from "../../SOLID/NotificationHandler";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";

async function handleSendLike(senderWebId, post, author) {
    console.log(post);
    let error = await sendLike(senderWebId, post.url, author.webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Sent like!"})
}


async function handleDeletePost(post, updateList) {
    createLoadingNotification("deleting-post", "Deleting post...", "", 
        () => deletePost(post.url), updateList);
}

export function PostGrid(props) {
    const [postList, setPostList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("post grid fetch")
        fetchPosts(props.user.podRootDir, props.authorised).then(([success, posts, errors]) => {
            if (!success) {
                createErrorNotification(errors[0]);
                setLoading(false);
                return;
            }
            setPostList(posts);
            if (props.authorised) errors.forEach(error => createErrorNotification(error));
            setLoading(false);
        })
    }, [props]);

    const postComponents = postList.map((post, index) => {
        return (
            <Center>
                <Post
                    author={props.author}
                    key={index}
                    authorised={props.authorised}
                    post={post}
                    deletePost={() => handleDeletePost(post, props.updatePosts)}
                    sendLike={() => handleSendLike(props.user.webId, post, props.author)}
                    editPost={() => props.editPost(post)}
                />
            </Center>)
        });

    return (
        <Skeleton visible={loading}>
            {postList.length > 0? 
                <SimpleGrid 
                    cols={3}
                    breakpoints={[
                        { maxWidth: 1400, cols: 2, spacing: 'sm' },
                        { maxWidth: 1000, cols: 1, spacing: 'sm' },
                ]}>
                    {postComponents}
                </SimpleGrid>
            :
                <>
                {props.emptyComponent}
                </>
            }
        </Skeleton>
    );
}