import { SimpleGrid } from "@mantine/core";
import { deletePost } from "../SOLID/PostHandler";
import { createErrorNotification } from "./ErrorNotification";
import {Post} from "./Post";

async function handleDeletePost(post, posts, host) {
    console.log("handle delete");
    const [success, error] = await deletePost(post.dir);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    let list = [...posts];
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i].name === post.name) {
            break;
        }
    }
    list.splice(i, 1);
    host.setState(prevState => (
        {...prevState, 
        postList: list,
    }));
}

export function PostGrid(props) {

    const postComponents = props.posts.map((post) => {
        console.log(post);
        return (<Post 
            post={post}
            deletePost={() => handleDeletePost(post, props.posts, props.host)} 
            />)
        });

    return (
        <SimpleGrid 
            cols={3}
            
            breakpoints={[
                { maxWidth: 1600, cols: 2, spacing: 'sm' },
                { maxWidth: 1200, cols: 1, spacing: 'sm' },
        ]}>
            {postComponents}
        </SimpleGrid>
    );
}