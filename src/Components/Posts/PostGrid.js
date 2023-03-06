import { SimpleGrid, Skeleton } from "@mantine/core";
import { deletePost, fetchPosts } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import {Post} from "./Post";
import { useState, useEffect } from "react";
import { POSTS_DIR } from "../../SOLID/Utils";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";

async function handleDeletePost(post, posts, setPostList) {
    const [success, error] = await deletePost(post.dir);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Success", description: "Successfully deleted post!"});
    let list = [...posts];
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i].name === post.name) {
            break;
        }
    }
    list.splice(i, 1);
    setPostList(list);
}

export function PostGrid(props) {
    const [postList, setPostList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts(props.podRootDir).then(([posts, errors]) => {
            setPostList(posts);
            if (props.authorised) errors.forEach(error => createErrorNotification(error));
            setLoading(false);
        })
    }, []);

    const postComponents = postList.map((post, index) => {
        return (<Post
            key={index}
            authorised={props.authorised}
            post={post}
            deletePost={() => handleDeletePost(post, postList, setPostList)} 
            />)
        });

    return (
        <Skeleton visible={loading}>
            {postList.length > 0? 
                <SimpleGrid 
                    cols={3}
                    
                    breakpoints={[
                        { maxWidth: 1600, cols: 2, spacing: 'sm' },
                        { maxWidth: 1200, cols: 1, spacing: 'sm' },
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